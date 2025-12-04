import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";

export async function getNewOrdersCount() {
  const [{ count: newOrdersCount }] = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.orderStatus, "new"));

  return newOrdersCount;
}
