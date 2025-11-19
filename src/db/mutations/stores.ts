import { eq, not } from "drizzle-orm";
import { db } from "@/db";
import type { StoreSchema } from "@/validation/stores";
import { stores } from "../schema";
import { draftSlug } from "../utils";

export const MUTATIONS = {
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

    TOGGLE_IS_ACTIVE: async (storeId: string): Promise<{ id: string }> => {
      const [updatedStore] = await db
        .update(stores)
        .set({ isActive: not(stores.isActive) })
        .where(eq(stores.id, storeId))
        .returning({ id: stores.id });

      return { id: updatedStore.id };
    },
  },
};
