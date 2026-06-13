"use server";

import { eq, inArray, not } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { draftSlug } from "@/db/utils";
import { logActivityBatch } from "@/features/activity-log/api/log";
import { requireAdmin } from "@/lib/auth/guards";
import { createId } from "@/lib/ids";
import type { StoreSchema } from "@/lib/stores/types";

export async function createDraftStoreAction() {
  await requireAdmin();

  const [newDraftStore] = await db
    .insert(stores)
    .values({})
    .returning({ id: stores.id });

  updateTag("stores");

  redirect(`/admin/eshop/stores/${newDraftStore.id}`);
}

export async function updateStoreAction({
  id,
  store,
}: {
  id: string;
  store: StoreSchema;
}) {
  await requireAdmin();

  const currentStore = await db.query.stores.findFirst({
    where: eq(stores.id, id),
    columns: { slug: true },
  });

  // Check if slug is taken by another store
  if (store.slug) {
    const existingStore = await db.query.stores.findFirst({
      where: (s, { and: andFn, eq: eqFn, ne }) =>
        andFn(eqFn(s.slug, store.slug), ne(s.id, id)),
      columns: { id: true },
    });

    if (existingStore) {
      return { success: false, error: "SLUG_TAKEN" };
    }
  }

  const [updatedStore] = await db
    .update(stores)
    .set(store)
    .where(eq(stores.id, id))
    .returning();

  // Store may have been deleted by a concurrent request between the read above
  // and this update, leaving updatedStore undefined.
  if (!updatedStore) {
    return { success: false, error: "STORE_NOT_FOUND" };
  }

  updateTag("stores");
  updateTag(`store-${updatedStore.slug}`);
  if (currentStore?.slug && currentStore.slug !== updatedStore.slug) {
    updateTag(`store-${currentStore.slug}`);
  }

  return { success: true, store: updatedStore };
}

export async function copyStoreAction({ storeId }: { storeId: string }) {
  await requireAdmin();

  const referenceStore = await db.query.stores.findFirst({
    where: (store, { eq: eqFn }) => eqFn(store.id, storeId),
  });

  if (!referenceStore) {
    return { success: false, error: "STORE_NOT_FOUND" };
  }

  const newStoreData = {
    ...referenceStore,
    id: undefined, // We don't want to copy the id
    // Let the DB assign fresh timestamps instead of inheriting the original's.
    createdAt: undefined,
    updatedAt: undefined,
    slug: draftSlug(referenceStore.name),
  };

  const [newStore] = await db
    .insert(stores)
    .values(newStoreData)
    .returning({ id: stores.id, slug: stores.slug });

  updateTag("stores");
  updateTag(`store-${newStore.slug}`);

  return { id: newStore.id };
}

export async function toggleIsActiveStoresAction({ ids }: { ids: string[] }) {
  await requireAdmin();

  const updatedStores = await db
    .update(stores)
    .set({ isActive: not(stores.isActive) })
    .where(inArray(stores.id, ids))
    .returning({ id: stores.id, slug: stores.slug });

  updateTag("stores");
  for (const store of updatedStores) {
    updateTag(`store-${store.slug}`);
  }

  return {
    success: true,
    ids: updatedStores.map((store) => store.id),
  };
}

/**
 * Soft delete only. Stores carry order-history attribution — "delete"
 * deactivates, never removes rows.
 */
export async function deleteStoresAction({ ids }: { ids: string[] }) {
  const admin = await requireAdmin();

  const deactivatedStores = await db
    .update(stores)
    .set({ isActive: false })
    .where(inArray(stores.id, ids))
    .returning({ id: stores.id, slug: stores.slug, name: stores.name });

  updateTag("stores");
  for (const store of deactivatedStores) {
    updateTag(`store-${store.slug}`);
  }

  const batchId = createId();
  logActivityBatch(
    deactivatedStores.map((store) => ({
      action: "store.deactivated" as const,
      entityType: "store" as const,
      entityId: store.id,
      actor: { id: admin.id, type: "staff" as const, label: admin.name },
      summary: `Predajňa deaktivovaná · ${store.name}`,
      metadata: { batchId, context: store.name },
    }))
  );

  return {
    success: true,
    ids: deactivatedStores.map((store) => store.id),
  };
}
