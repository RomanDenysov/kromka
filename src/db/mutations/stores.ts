import { eq, type InferInsertModel } from "drizzle-orm";
import { db } from "@/db";
import { getSlug } from "@/lib/get-slug";
import { createShortId } from "@/lib/ids";
import { stores } from "../schema";

type StoreInsert = InferInsertModel<typeof stores>;

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
    slug: `${getSlug(DRAFT_DEFAULTS.name)}-${createShortId()}`,
    ...overrides,
  };
}

export const MUTATIONS = {
  ADMIN: {
    CREATE_DRAFT_STORE: async (userId: string) => {
      const draftStoreData: StoreInsert = createDraftStoreData();

      const [newDraftStore] = await db
        .insert(stores)
        .values({ createdBy: userId, ...draftStoreData })
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
