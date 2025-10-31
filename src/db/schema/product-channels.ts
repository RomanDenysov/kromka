import { relations } from "drizzle-orm";
import { boolean, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { channelEnum } from "./enums";
import { products } from "./products";

export const productChannels = pgTable(
  "product_channels",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    channel: channelEnum("channel").notNull(),
    isListed: boolean("is_listed").default(true).notNull(),
  },
  (table) => [primaryKey({ columns: [table.productId, table.channel] })]
);

export const productChannelsRelations = relations(
  productChannels,
  ({ one }) => ({
    product: one(products, {
      fields: [productChannels.productId],
      references: [products.id],
    }),
  })
);
