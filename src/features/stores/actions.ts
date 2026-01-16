"use server";

import { eq, inArray, not } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { draftSlug } from "@/db/utils";
import { requireAdmin } from "@/lib/auth/guards";
import type { StoreSchema } from "@/lib/stores/types";

export async function createDraftStoreAction() {
  await requireAdmin();

  const [newDraftStore] = await db
    .insert(stores)
    .values({})
    .returning({ id: stores.id });

  updateTag("stores");

  redirect(`/admin/stores/${newDraftStore.id}`);
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
    throw new Error("Store not found");
  }

  const newStoreData = {
    ...referenceStore,
    id: undefined, // We don't want to copy the id
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

export async function deleteStoresAction({ ids }: { ids: string[] }) {
  await requireAdmin();

  const deletedStores = await db
    .delete(stores)
    .where(inArray(stores.id, ids))
    .returning({ id: stores.id, slug: stores.slug });

  updateTag("stores");
  for (const store of deletedStores) {
    updateTag(`store-${store.slug}`);
  }

  return {
    success: true,
    ids: deletedStores.map((store) => store.id),
  };
}
