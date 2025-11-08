import { eq } from "drizzle-orm";
import { db } from "@/db";
import { getSlug } from "@/lib/get-slug";
import { createShortId } from "@/lib/ids";
import { stores } from "../schema";

type StoreInsert = typeof stores.$inferInsert;

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
  overrides: Partial<StoreInsert> = {}
): StoreInsert {
  return {
    ...DRAFT_DEFAULTS,
    slug: `${getSlug("new-store")}-${createShortId()}`,

    ...overrides,
  };
}

export const MUTATIONS = {
  ADMIN: {
    CREATE_DRAFT_STORE: async () => {
      const draftStoreData: StoreInsert = createDraftStoreData();

      const [newDraftStore] = await db
        .insert(stores)
        .values(draftStoreData)
        .returning();

      return newDraftStore;
    },
    UPDATE_STORE: async (storeId: string, store: Partial<StoreInsert>) => {
      const [updatedStore] = await db
        .update(stores)
        .set(store)
        .where(eq(stores.id, storeId))
        .returning();
      return updatedStore;
    },
  },
};
