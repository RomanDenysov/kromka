import { boolean, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { products } from "./products";

const channels = ["B2B", "B2C"] as const;
type ProductChannel = (typeof channels)[number];

export const productChannels = pgTable(
  "product_channels",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    channel: text("channel").notNull().$type<ProductChannel>(),
    isListed: boolean("is_listed").default(true).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.channel] }),
  })
);
