"use server";

import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db } from "@/db";
import { invoices, orders, organizations } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { log } from "@/lib/logger";

const INVOICE_NUMBER_PADDING = 4;

const DEFAULT_PAYMENT_TERM_DAYS = 14;

/**
 * Generate invoice number
 * Format: VS-YYYY-NNNN (e.g., VS-2025-0001)
 */
const MAX_INVOICE_NUMBER_RETRIES = 3;

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `VS-${year}-`;

  for (let attempt = 0; attempt < MAX_INVOICE_NUMBER_RETRIES; attempt++) {
    // Find the highest invoice number for this year
    const lastInvoice = await db.query.invoices.findFirst({
      where: (invoice, { like }) => like(invoice.invoiceNumber, `${prefix}%`),
      columns: { invoiceNumber: true },
      orderBy: (invoice, { desc }) => [desc(invoice.invoiceNumber)],
    });

    let candidate: string;
    if (lastInvoice?.invoiceNumber) {
      const lastNum = Number.parseInt(
        lastInvoice.invoiceNumber.slice(-INVOICE_NUMBER_PADDING),
        10
      );
      const nextNum = (lastNum + 1)
        .toString()
        .padStart(INVOICE_NUMBER_PADDING, "0");
      candidate = `${prefix}${nextNum}`;
    } else {
      candidate = `${prefix}0001`;
    }

    // Check for collision
    const existing = await db.query.invoices.findFirst({
      where: (invoice, { eq: eqOp }) =>
        eqOp(invoice.invoiceNumber, candidate),
      columns: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Nepodarilo sa vygenerovať číslo faktúry");
}

/**
 * Generate invoice for a company's unpaid invoice orders
 * Collects all orders with paymentMethod="invoice" and paymentStatus="pending"
 */
export async function generateInvoiceForCompany(
  companyId: string,
  periodStart: Date,
  periodEnd: Date
) {
  await requireAdmin();

  // Get all unpaid invoice orders for this company in the period (not yet claimed by another invoice)
  const unpaidOrders = await db.query.orders.findMany({
    where: and(
      eq(orders.companyId, companyId),
      eq(orders.paymentMethod, "invoice"),
      eq(orders.paymentStatus, "pending"),
      isNull(orders.invoiceId),
      sql`${orders.createdAt} >= ${periodStart}`,
      sql`${orders.createdAt} <= ${periodEnd}`
    ),
    with: {
      items: true,
    },
  });

  if (unpaidOrders.length === 0) {
    throw new Error("No unpaid orders found for this period");
  }

  // Calculate total
  const totalCents = unpaidOrders.reduce(
    (sum, order) => sum + order.totalCents,
    0
  );

  // Get organization for due date calculation
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, companyId),
    columns: { paymentTermDays: true },
  });

  const paymentTermDays = org?.paymentTermDays ?? DEFAULT_PAYMENT_TERM_DAYS;
  const dueDate = new Date(periodEnd);
  dueDate.setDate(dueDate.getDate() + paymentTermDays);

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber();

  // Create invoice
  const [invoice] = await db
    .insert(invoices)
    .values({
      orgId: companyId,
      periodStart,
      periodEnd,
      status: "draft",
      totalCents,
      dueDate,
      invoiceNumber,
    })
    .returning();

  // Link orders to invoice — use specific IDs + isNull guard to prevent race condition
  const orderIds = unpaidOrders.map((o) => o.id);
  const updatedOrders = await db
    .update(orders)
    .set({ invoiceId: invoice.id })
    .where(
      and(
        inArray(orders.id, orderIds),
        isNull(orders.invoiceId)
      )
    )
    .returning({ id: orders.id });

  if (updatedOrders.length !== orderIds.length) {
    log.invoices.warn(
      { expected: orderIds.length, actual: updatedOrders.length, invoiceId: invoice.id },
      "Some orders were already claimed by another invoice"
    );
  }

  updateTag("invoices");
  updateTag("orders");

  return invoice.id;
}

/**
 * Mark invoice as issued (PDF generated and sent)
 */
export async function issueInvoice(invoiceId: string, pdfUrl: string) {
  await requireAdmin();
  const [updated] = await db
    .update(invoices)
    .set({
      status: "issued",
      issuedAt: new Date(),
      pdfUrl,
    })
    .where(and(eq(invoices.id, invoiceId), eq(invoices.status, "draft")))
    .returning({ id: invoices.id });

  if (!updated) {
    throw new Error("Faktúru je možné vydať iba zo stavu 'koncept'");
  }

  updateTag("invoices");
}

/**
 * Mark invoice as paid (updates all linked orders' paymentStatus)
 */
export async function markInvoiceAsPaid(invoiceId: string) {
  await requireAdmin();
  // Update invoice (only if currently issued)
  const [updated] = await db
    .update(invoices)
    .set({
      status: "paid",
      paidAt: new Date(),
    })
    .where(and(eq(invoices.id, invoiceId), eq(invoices.status, "issued")))
    .returning({ id: invoices.id });

  if (!updated) {
    throw new Error("Faktúru je možné označiť ako zaplatenú iba zo stavu 'vydaná'");
  }

  // Update all linked orders
  await db
    .update(orders)
    .set({ paymentStatus: "paid" })
    .where(eq(orders.invoiceId, invoiceId));

  updateTag("invoices");
  updateTag("orders");
}
