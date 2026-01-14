"use client";

import posthog from "posthog-js";
import { use, useEffect, useRef } from "react";
import type { Store } from "@/features/stores/queries";
import { useConsent } from "@/hooks/use-consent";
import type { User } from "@/lib/auth/session";
import { useCustomerActions, useSelectedStore } from "@/store/customer-store";

type Props = {
  storesPromise: Promise<Store[]>;
  userPromise: Promise<User>;
};

/**
 * Syncs customer store selection with auth user and validates persisted data.
 * DEPRECATED: Guest PII handling moved to httpOnly cookies (src/features/checkout/cookies.ts)
 *
 * Handles:
 * - Validates persisted storeId (clears if deleted)
 * - Auth user's storeId → Zustand sync (only on initial mount if no store selected)
 * - PostHog store tracking for analytics
 */
export function CustomerStoreSync({ storesPromise, userPromise }: Props) {
  const stores = use(storesPromise);
  const user = use(userPromise);
  const { analytics } = useConsent();

  const customerStore = useSelectedStore();
  const { setCustomerStore, clearStaleStore } = useCustomerActions();

  const lastSyncedStoreId = useRef<string | null>(null);
  const hasInitializedFromUser = useRef(false);

  // Validate persisted store and handle initial sync from user
  useEffect(() => {
    const storeIds = new Set(stores.map((s) => s.id));

    // 1. Validate persisted store - clear if deleted
    if (customerStore?.id && !storeIds.has(customerStore.id)) {
      clearStaleStore();
      return;
    }

    // 2. Initial sync: if no store selected and user has a valid storeId, use it
    // Only runs once per mount to avoid overriding user selections
    if (
      !(hasInitializedFromUser.current || customerStore?.id) &&
      user?.storeId &&
      storeIds.has(user.storeId)
    ) {
      const userStore = stores.find((s) => s.id === user.storeId);
      if (userStore) {
        setCustomerStore({ id: userStore.id, name: userStore.name });
      }
      hasInitializedFromUser.current = true;
    }

    // Mark as initialized even if user has no storeId
    if (!hasInitializedFromUser.current) {
      hasInitializedFromUser.current = true;
    }
  }, [stores, user, customerStore?.id, setCustomerStore, clearStaleStore]);

  // Sync store to PostHog for analytics
  useEffect(() => {
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
  }, [analytics, customerStore]);

  return null;
}
