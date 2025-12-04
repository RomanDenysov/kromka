import { count, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { orders } from "@/db/schema";

export async function getNewOrdersCount() {
  "use cache";

  cacheLife("hours");
  cacheTag("new-orders-count");

  const [{ count: newOrdersCount }] = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.orderStatus, "new"));

  return newOrdersCount;
}
