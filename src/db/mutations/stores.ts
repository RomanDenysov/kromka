import { eq } from "drizzle-orm";
import { db } from "@/db";
import { getSlug } from "@/lib/get-slug";
import { createShortId } from "@/lib/ids";
import { stores } from "../schema";
import type { CreateStore } from "../schemas";

const DRAFT_DEFAULTS = Object.freeze({
  name: "New Store",
  description: "New Store Description",
  isActive: false,
  sortOrder: 0,
  address: {
    street: "",
    postalCode: "",
    city: "Berlin",
    country: "DE",
    googleId: "",
  },
  openingHours: {
    weekdays: { open: "07:00", close: "17:00" },
    saturday: { open: "09:00", close: "17:00" },
  },
});

function createDraftStoreData(
  overrides: Partial<CreateStore> = {}
): CreateStore {
  return {
    ...DRAFT_DEFAULTS,
    slug: `${getSlug("new-store")}-${createShortId()}`,

    ...overrides,
  };
}

export const MUTATIONS = {
  ADMIN: {
    CREATE_DRAFT_STORE: async () => {
      const draftStoreData: CreateStore = createDraftStoreData();

      const [newDraftStore] = await db
        .insert(stores)
        .values(draftStoreData)
        .returning();

      return newDraftStore;
    },
    UPDATE_STORE: async (storeId: string, store: CreateStore) => {
      const [updatedStore] = await db
        .update(stores)
        .set(store)
        .where(eq(stores.id, storeId))
        .returning();
      return updatedStore;
    },
  },
};
