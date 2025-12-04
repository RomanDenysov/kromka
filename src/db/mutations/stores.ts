import "server-only";

import { eq, inArray, not } from "drizzle-orm";
import { db } from "@/db";
import { stores, users } from "@/db/schema";
import { draftSlug } from "@/db/utils";
import type { StoreSchema } from "@/validation/stores";

export const MUTATIONS = {
  PUBLIC: {
    SET_USER_STORE: async (storeId: string, userId: string): Promise<void> => {
      await db.update(users).set({ storeId }).where(eq(users.id, userId));
    },
  },
  ADMIN: {
    CREATE_DRAFT_STORE: async (): Promise<{ id: string }> => {
      const [newDraftStore] = await db
        .insert(stores)
        .values({})
        .returning({ id: stores.id });

      return { id: newDraftStore.id };
    },
    UPDATE_STORE: async (storeId: string, store: StoreSchema) => {
      const [updatedStore] = await db
        .update(stores)
        .set(store)
        .where(eq(stores.id, storeId))
        .returning();
      return updatedStore;
    },

    COPY_STORE: async (storeId: string): Promise<{ id: string }> => {
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

      return { id: newStore.id };
    },

    TOGGLE_IS_ACTIVE: async (storeIds: string[]): Promise<{ id: string }[]> => {
      const updatedStores = await db
        .update(stores)
        .set({ isActive: not(stores.isActive) })
        .where(inArray(stores.id, storeIds))
        .returning({ id: stores.id });

      return updatedStores.map((store) => ({ id: store.id }));
    },
    DELETE_STORE: async (ids: string[]): Promise<{ id: string }> => {
      const [deletedStore] = await db
        .delete(stores)
        .where(inArray(stores.id, ids))
        .returning({ id: stores.id });
      return { id: deletedStore.id };
    },
  },
};
