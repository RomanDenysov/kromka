"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { invoices, orders, organizations } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

const INVOICE_NUMBER_PADDING = 4;

const DEFAULT_PAYMENT_TERM_DAYS = 14;

/**
 * Generate invoice number
 * Format: VS-YYYY-NNNN (e.g., VS-2025-0001)
 */
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `VS-${year}-`;

  // Find the highest invoice number for this year
  const lastInvoice = await db.query.invoices.findFirst({
    where: (invoice, { like }) => like(invoice.invoiceNumber, `${prefix}%`),
    columns: { invoiceNumber: true },
    orderBy: (invoice, { desc }) => [desc(invoice.invoiceNumber)],
  });

  if (lastInvoice?.invoiceNumber) {
    const lastNum = Number.parseInt(
      lastInvoice.invoiceNumber.slice(-INVOICE_NUMBER_PADDING),
      10
    );
    const nextNum = (lastNum + 1)
      .toString()
      .padStart(INVOICE_NUMBER_PADDING, "0");
    return `${prefix}${nextNum}`;
  }

  return `${prefix}0001`;
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

  // Get all unpaid invoice orders for this company in the period
  const unpaidOrders = await db.query.orders.findMany({
    where: and(
      eq(orders.companyId, companyId),
      eq(orders.paymentMethod, "invoice"),
      eq(orders.paymentStatus, "pending"),
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

  // Link orders to invoice
  await db
    .update(orders)
    .set({ invoiceId: invoice.id })
    .where(
      and(
        eq(orders.companyId, companyId),
        eq(orders.paymentMethod, "invoice"),
        eq(orders.paymentStatus, "pending"),
        sql`${orders.createdAt} >= ${periodStart}`,
        sql`${orders.createdAt} <= ${periodEnd}`
      )
    );

  return invoice.id;
}

/**
 * Mark invoice as issued (PDF generated and sent)
 */
export async function issueInvoice(invoiceId: string, pdfUrl: string) {
  await requireAdmin();
  await db
    .update(invoices)
    .set({
      status: "issued",
      issuedAt: new Date(),
      pdfUrl,
    })
    .where(eq(invoices.id, invoiceId));
}

/**
 * Mark invoice as paid (updates all linked orders' paymentStatus)
 */
export async function markInvoiceAsPaid(invoiceId: string) {
  await requireAdmin();
  // Update invoice
  await db
    .update(invoices)
    .set({
      status: "paid",
      paidAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));

  // Update all linked orders
  await db
    .update(orders)
    .set({ paymentStatus: "paid" })
    .where(eq(orders.invoiceId, invoiceId));
}
