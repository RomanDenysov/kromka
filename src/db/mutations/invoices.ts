import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import type { InvoiceItemSchema, InvoiceSchema } from "@/validation/invoices";
import { invoiceItems, invoices } from "../schema";

const MAX_INVOICE_NUMBER_LENGTH = 4;

async function generateInvoiceNumber(
  series: string,
  companyId: string | null
): Promise<string> {
  // Get the latest invoice number for this series and company
  const latestInvoice = await db.query.invoices.findFirst({
    where: (invoice, { eq: eqFn, and: andFn }) => {
      const conditions = [eqFn(invoice.series, series)];
      if (companyId) {
        conditions.push(eqFn(invoice.companyId, companyId));
      }
      return andFn(...conditions);
    },
    orderBy: (invoice, { desc }) => [desc(invoice.createdAt)],
  });

  let nextNumber = 1;
  if (latestInvoice?.number) {
    // Extract number from format like "A-0001" or "A-2024-0001"
    // biome-ignore lint/performance/useTopLevelRegex: TODO: Refactor this later
    const match = latestInvoice.number.match(/-(\d+)$/);
    if (match) {
      nextNumber = Number.parseInt(match[1], 10) + 1;
    }
  }

  const paddedNumber = String(nextNumber).padStart(
    MAX_INVOICE_NUMBER_LENGTH,
    "0"
  );
  return `${series}-${paddedNumber}`;
}

export const MUTATIONS = {
  ADMIN: {
    CREATE_DRAFT_INVOICE: async (
      userId: string,
      invoice: Partial<Omit<InvoiceSchema, "id" | "number" | "createdBy">> = {}
    ) => {
      const series = invoice.series ?? "A";
      const invoiceNumber = await generateInvoiceNumber(
        series,
        invoice.companyId ?? null
      );

      const [newInvoice] = await db
        .insert(invoices)
        .values({
          number: invoiceNumber,
          series,
          createdBy: userId,
          ...invoice,
          subtotalCents: invoice.subtotalCents ?? 0,
          taxCents: invoice.taxCents ?? 0,
          totalCents: invoice.totalCents ?? 0,
        })
        .returning();

      return newInvoice;
    },

    UPDATE_INVOICE: async (
      invoiceId: string,
      invoice: Partial<Omit<InvoiceSchema, "id" | "number">>
    ) => {
      const [updatedInvoice] = await db
        .update(invoices)
        .set(invoice)
        .where(eq(invoices.id, invoiceId))
        .returning();

      return updatedInvoice;
    },

    UPDATE_INVOICE_STATUS: async (
      invoiceId: string,
      status: InvoiceSchema["status"],
      additionalFields?: Partial<Omit<InvoiceSchema, "id" | "number">>
    ) => {
      const [updatedInvoice] = await db
        .update(invoices)
        .set({
          status,
          ...additionalFields,
        })
        .where(eq(invoices.id, invoiceId))
        .returning();

      return updatedInvoice;
    },

    ADD_INVOICE_ITEM: async (
      invoiceId: string,
      item: Omit<InvoiceItemSchema, "invoiceId" | "createdAt" | "updatedAt">
    ) => {
      const [newItem] = await db
        .insert(invoiceItems)
        .values({
          invoiceId,
          ...item,
        })
        .returning();

      return newItem;
    },

    UPDATE_INVOICE_ITEM: async (
      invoiceId: string,
      lineId: string,
      item: Partial<
        Omit<
          InvoiceItemSchema,
          "invoiceId" | "lineId" | "createdAt" | "updatedAt"
        >
      >
    ) => {
      const [updatedItem] = await db
        .update(invoiceItems)
        .set(item)
        .where(
          and(
            eq(invoiceItems.invoiceId, invoiceId),
            eq(invoiceItems.lineId, lineId)
          )
        )
        .returning();

      return updatedItem;
    },

    REMOVE_INVOICE_ITEM: async (invoiceId: string, lineId: string) => {
      await db
        .delete(invoiceItems)
        .where(
          and(
            eq(invoiceItems.invoiceId, invoiceId),
            eq(invoiceItems.lineId, lineId)
          )
        );

      return { success: true };
    },
  },
};
