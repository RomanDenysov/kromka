import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { organizations } from "./auth";
import { invoiceStatusEnum } from "./enums";
import { products } from "./products";

type Address = {
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};

export const invoices = pgTable(
  "invoices",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    number: text("number").notNull().unique(),
    series: text("series").notNull().default("A"),
    currency: text("currency").notNull(),
    status: invoiceStatusEnum("status").notNull().default("draft"),

    issueDate: timestamp("issue_date").defaultNow().notNull(),
    dueDate: timestamp("due_date"),
    sentAt: timestamp("sent_at"),
    paidAt: timestamp("paid_at"),

    billingAddress: jsonb("billing_address").$type<Address>(),
    notes: text("notes"),

    subtotalCents: integer("subtotal_cents").notNull(),
    taxCents: integer("tax_cents").notNull(),
    totalCents: integer("total_cents").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("idx_invoices_company").on(table.companyId),
    index("idx_invoices_status").on(table.status),
    index("idx_invoices_issue_date").on(table.issueDate),
  ]
);

export const invoiceItems = pgTable(
  "invoice_items",
  {
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    lineId: text("line_id").notNull(),
    productId: text("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    sku: text("sku"),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitPriceCents: integer("unit_price_cents").notNull(),
    taxRatePct: integer("tax_rate_pct"),
    totalCents: integer("total_cents").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.invoiceId, table.lineId] })]
);
