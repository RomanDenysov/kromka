/**
 * Get badge counts for sidebar items
 * TODO: Replace placeholder queries with actual table queries when schemas are ready
 */
// biome-ignore lint/suspicious/useAwait: <explanation>
export async function getBadgeCounts(): Promise<Record<string, number>> {
  // TODO: Replace these with actual database queries when order/invoice/comment tables exist
  // Example:
  // const b2cOrders = await db.select({ count: count() }).from(b2cOrdersTable).where(...);
  // const b2bOrders = await db.select({ count: count() }).from(b2bOrdersTable).where(...);
  // const b2bInvoices = await db.select({ count: count() }).from(b2bInvoicesTable).where(...);
  // const blogComments = await db.select({ count: count() }).from(blogCommentsTable).where(...);

  return {
    "b2c.orders": 10,
    "b2b.orders": 30,
    "b2b.invoices": 123,
    "blog.comments": 300,
  };
}
