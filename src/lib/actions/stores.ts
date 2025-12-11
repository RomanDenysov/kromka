"use server";

import { eq, inArray, not } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { stores, users } from "@/db/schema";
import { draftSlug } from "@/db/utils";
import type { StoreSchema } from "@/validation/stores";
import { getAuth } from "../auth/session";

export async function setUserStore(
  storeId: string
): Promise<{ success: boolean }> {
  const { user } = await getAuth();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await db.update(users).set({ storeId }).where(eq(users.id, user.id));

  return { success: true };
}

export async function createDraftStoreAction() {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

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
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

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

  return { success: true, store: updatedStore };
}

export async function copyStoreAction({ storeId }: { storeId: string }) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

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
    .returning({ id: stores.id });

  updateTag("stores");

  return { id: newStore.id };
}

export async function toggleIsActiveStoresAction({ ids }: { ids: string[] }) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const updatedStores = await db
    .update(stores)
    .set({ isActive: not(stores.isActive) })
    .where(inArray(stores.id, ids))
    .returning({ id: stores.id, slug: stores.slug });

  // TODO: DELETE IT AFTER RELEASE
  // biome-ignore lint/complexity/noForEach: We need to revalidate the paths for each store
  updatedStores.forEach((store) => {
    revalidatePath(`/admin/stores/${store.id}`);
  });

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
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const deletedStores = await db
    .delete(stores)
    .where(inArray(stores.id, ids))
    .returning({ id: stores.id, slug: stores.slug });

  // TODO: DELETE IT AFTER RELEASE
  // biome-ignore lint/complexity/noForEach: We need to revalidate the paths for each store
  deletedStores.forEach((store) => {
    revalidatePath(`/admin/stores/${store.id}`);
  });

  updateTag("stores");
  for (const store of deletedStores) {
    updateTag(`store-${store.slug}`);
  }

  return {
    success: true,
    ids: deletedStores.map((store) => store.id),
  };
}
