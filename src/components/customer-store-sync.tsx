"use client";

import posthog from "posthog-js";
import { use, useEffect, useRef } from "react";
import type { Store } from "@/features/stores/queries";
import { useConsent } from "@/hooks/use-consent";
import type { User } from "@/lib/auth/session";
import {
  useCustomerActions,
  useGuestInfoSavedAt,
  useSelectedStore,
} from "@/store/customer-store";

const GUEST_INFO_EXPIRY_DAYS = 30;
const GUEST_INFO_EXPIRY_MS = GUEST_INFO_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

type Props = {
  storesPromise: Promise<Store[]>;
  userPromise: Promise<User>;
};

/**
 * Syncs customer store state with auth user and validates persisted data.
 * Similar pattern to AuthIdentitySync.
 *
 * Handles:
 * - Validates persisted storeId (clears if deleted)
 * - Auth user's storeId → Zustand sync
 * - Guest info expiration (30 days)
 * - PostHog store tracking
 */
export function CustomerStoreSync({ storesPromise, userPromise }: Props) {
  const stores = use(storesPromise);
  const user = use(userPromise);
  const { analytics } = useConsent();

  const customerStore = useSelectedStore();
  const guestInfoSavedAt = useGuestInfoSavedAt();
  const { setCustomerStore, clearGuestInfo, clearStaleStore } =
    useCustomerActions();

  const lastSyncedStoreId = useRef<string | null>(null);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: sync logic requires multiple conditional checks
  useEffect(() => {
    const storeIds = new Set(stores.map((s) => s.id));

    // 1. Validate persisted store - clear if deleted
    if (customerStore?.id && !storeIds.has(customerStore.id)) {
      clearStaleStore();
    }

    // 2. Sync auth user's storeId to Zustand (if user has one and it's valid)
    if (user?.storeId && storeIds.has(user.storeId)) {
      const userStore = stores.find((s) => s.id === user.storeId);
      if (userStore && customerStore?.id !== user.storeId) {
        setCustomerStore({ id: userStore.id, name: userStore.name });
      }
    }

    // 3. Expire old guest info (privacy)
    if (!user && guestInfoSavedAt) {
      const isExpired = Date.now() - guestInfoSavedAt > GUEST_INFO_EXPIRY_MS;
      if (isExpired) {
        clearGuestInfo();
      }
    }

    // 4. Sync store to PostHog
    if (
      analytics &&
      customerStore?.id &&
      customerStore.id !== lastSyncedStoreId.current
    ) {
      posthog.setPersonProperties({
        store_id: customerStore.id,
        store_name: customerStore.name,
      });
      lastSyncedStoreId.current = customerStore.id;
    }
  }, [
    user,
    stores,
    customerStore,
    guestInfoSavedAt,
    analytics,
    setCustomerStore,
    clearGuestInfo,
    clearStaleStore,
  ]);

  return null;
}
