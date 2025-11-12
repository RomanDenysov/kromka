import { eq, type InferInsertModel } from "drizzle-orm";
import { db } from "@/db";
import { getSlug } from "@/lib/get-slug";
import { createShortId } from "@/lib/ids";
import { stores } from "../schema";

type StoreInsert = InferInsertModel<typeof stores>;

const DRAFT_DEFAULTS = Object.freeze({
  name: "Nova predajňa",
  description: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Popis novej predajne..." }],
      },
    ],
  },
  isActive: false,
  sortOrder: 0,
  phone: "+421908589550",
  email: "kromka@kavejo.sk",
  address: {
    street: "17. novembra 104",
    postalCode: "080 01",
    city: "Prešov",
    country: "Slovakia",
    googleId: "8vEL5DjJF84PASjx7",
  },
  openingHours: {
    weekdays: { open: "07:00", close: "18:00" },
    saturday: { open: "08:00", close: "12:00" },
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
