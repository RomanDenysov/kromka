import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { and, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
// biome-ignore lint/performance/noNamespaceImport: script needs full schema
import * as schema from "@/db/schema";
import {
  orderItems,
  orderStatusEvents,
  orders,
  products,
  stores,
} from "@/db/schema";
import { createOrderNumber, createPrefixedId } from "@/lib/ids";

dotenv.config({ path: ".env" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sqlClient = neon(DATABASE_URL);
const db = drizzle({ client: sqlClient, schema });

const CONCURRENCY = 50;
const ID_SYNC_COUNT = 10_000;
const ID_ASYNC_COUNT = 1000;
const TEST_EMAIL_PATTERN = "stress-test-";
const TEST_EMAIL_DOMAIN = "@test.local";
const MAX_PERSIST_ATTEMPTS = 2;
const DB_URL_MASK_REGEX = /:[^@]+@/;

interface TestOrderResult {
  collisionRetries: number;
  durationMs: number;
  error?: string;
  orderId?: string;
  orderNumber?: string;
  success: boolean;
}

async function findTestData() {
  const store = await db.query.stores.findFirst({
    where: eq(stores.isActive, true),
    columns: { id: true, name: true },
  });

  const product = await db.query.products.findFirst({
    where: and(eq(products.isActive, true), eq(products.status, "active")),
    columns: { id: true, name: true, priceCents: true },
  });

  if (!store) {
    console.error("No active store found in DB. Cannot run stress test.");
    process.exit(1);
  }
  if (!product) {
    console.error("No active product found in DB. Cannot run stress test.");
    process.exit(1);
  }

  console.log(`Using store: ${store.name} (${store.id})`);
  console.log(`Using product: ${product.name} (${product.id})`);
  return { store, product };
}

async function persistTestOrder(
  storeId: string,
  productId: string,
  priceCents: number,
  index: number
): Promise<TestOrderResult> {
  const start = performance.now();
  let collisionRetries = 0;

  const email = `${TEST_EMAIL_PATTERN}${index}${TEST_EMAIL_DOMAIN}`;
  const customerInfo = {
    name: `Test User ${index}`,
    email,
    phone: "+421900000000",
  };
  const productSnapshot = {
    name: "Stress Test Product",
    price: priceCents,
    categoryName: null,
    basePriceCents: priceCents,
    effectivePriceCents: priceCents,
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const pickupDate = tomorrow.toISOString().split("T")[0];

  for (let attempt = 0; attempt < MAX_PERSIST_ATTEMPTS; attempt++) {
    const orderId = createPrefixedId("ord");
    const orderNumber = createOrderNumber("OBJ");
    const eventId = createPrefixedId("ose");

    const query = sql`
      WITH new_order AS (
        INSERT INTO ${orders} (
          id, order_number, created_by,
          customer_info, store_id, company_id,
          delivery_address, order_status, payment_status,
          payment_method, total_cents, pickup_date,
          pickup_time
        )
        VALUES (
          ${orderId}, ${orderNumber}, ${null},
          ${JSON.stringify(customerInfo)}::jsonb, ${storeId}, ${null},
          ${null}::jsonb, 'new', 'pending', 'in_store', ${priceCents},
          ${pickupDate}::date, '09:00'
        )
        RETURNING id, order_number
      ),
      new_items AS (
        INSERT INTO ${orderItems} (
          order_id, product_id,
          product_snapshot, quantity, price
        )
        SELECT new_order.id, ${productId}::text, ${JSON.stringify(productSnapshot)}::jsonb, 1::integer, ${priceCents}::integer
        FROM new_order
        RETURNING 1
      ),
      new_event AS (
        INSERT INTO ${orderStatusEvents} (
          id, order_id,
          status, created_by
        )
        SELECT ${eventId}, new_order.id, 'new', ${null}
        FROM new_order
        RETURNING 1
      )
      SELECT 1 FROM new_order
    `;

    try {
      await db.execute(query);
      return {
        success: true,
        orderId,
        orderNumber,
        durationMs: performance.now() - start,
        collisionRetries,
      };
    } catch (error) {
      const dbError = error as { code?: string };
      const isCollision =
        dbError.code === "23505" && attempt < MAX_PERSIST_ATTEMPTS - 1;

      if (!isCollision) {
        return {
          success: false,
          durationMs: performance.now() - start,
          collisionRetries,
          error: String(error),
        };
      }

      collisionRetries++;
    }
  }

  return {
    success: false,
    durationMs: performance.now() - start,
    collisionRetries,
    error: "Exhausted retry attempts",
  };
}

// --- Test 1: Concurrent order creation ---

async function testConcurrentOrders(
  storeId: string,
  productId: string,
  priceCents: number
) {
  console.log(
    `\n--- Test 1: Concurrent Order Creation (${CONCURRENCY} orders) ---`
  );

  const promises = Array.from({ length: CONCURRENCY }, (_, i) =>
    persistTestOrder(storeId, productId, priceCents, i)
  );

  const results = await Promise.allSettled(promises);

  const settled = results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : {
          success: false,
          durationMs: 0,
          collisionRetries: 0,
          error: String(r.reason),
        }
  );

  const successes = settled.filter((r) => r.success);
  const failures = settled.filter((r) => !r.success);
  const totalCollisions = settled.reduce(
    (sum, r) => sum + r.collisionRetries,
    0
  );
  const durations = settled.map((r) => r.durationMs).sort((a, b) => a - b);

  const min = Math.round(durations[0]);
  const avg = Math.round(
    durations.reduce((s, d) => s + d, 0) / durations.length
  );
  const p95 = Math.round(durations[Math.floor(durations.length * 0.95)]);
  const max = Math.round(durations.at(-1) ?? 0);

  console.log(`  Successful:         ${successes.length}`);
  console.log(`  Failed:             ${failures.length}`);
  console.log(`  Collisions (retry): ${totalCollisions}`);
  console.log(`  Latency min:        ${min}ms`);
  console.log(`  Latency avg:        ${avg}ms`);
  console.log(`  Latency p95:        ${p95}ms`);
  console.log(`  Latency max:        ${max}ms`);

  if (failures.length > 0) {
    console.log("\n  Failure details:");
    for (const f of failures.slice(0, 5)) {
      console.log(`    - ${f.error}`);
    }
  }

  return {
    successes: successes.length,
    failures: failures.length,
    totalCollisions,
  };
}

// --- Test 2: ID collision resistance ---

function testIdUniqueness() {
  console.log("\n--- Test 2: ID Collision Resistance ---");

  // Synchronous uniqueness
  const syncIds = new Set<string>();
  for (let i = 0; i < ID_SYNC_COUNT; i++) {
    syncIds.add(createOrderNumber("OBJ"));
  }
  const syncPass = syncIds.size === ID_SYNC_COUNT;
  console.log(
    `  Sync:  ${syncPass ? "PASS" : "FAIL"} (${syncIds.size}/${ID_SYNC_COUNT} unique)`
  );

  // Async uniqueness
  const asyncIds = Array.from({ length: ID_ASYNC_COUNT }, () =>
    Promise.resolve(createOrderNumber("OBJ"))
  );

  return Promise.all(asyncIds).then((ids) => {
    const uniqueAsync = new Set(ids);
    const asyncPass = uniqueAsync.size === ID_ASYNC_COUNT;
    console.log(
      `  Async: ${asyncPass ? "PASS" : "FAIL"} (${uniqueAsync.size}/${ID_ASYNC_COUNT} unique)`
    );
    return syncPass && asyncPass;
  });
}

// --- Test 3: CTE atomicity verification ---

async function testAtomicity() {
  console.log("\n--- Test 3: CTE Atomicity Verification ---");

  // Find test orders by customer email pattern
  const testOrders = await db.query.orders.findMany({
    where: sql`${orders.customerInfo}->>'email' LIKE ${`${TEST_EMAIL_PATTERN}%${TEST_EMAIL_DOMAIN}`}`,
    columns: { id: true },
  });

  const testOrderIds = testOrders.map((o) => o.id);

  if (testOrderIds.length === 0) {
    console.log("  SKIP - no test orders found (all may have failed)");
    return { orphanedItems: 0, missingEvents: 0, pass: true };
  }

  // Check: every test order has items
  const ordersWithData = await db.query.orders.findMany({
    where: inArray(orders.id, testOrderIds),
    columns: { id: true },
    with: {
      items: { columns: { orderId: true } },
      statusEvents: { columns: { id: true } },
    },
  });

  const orphanedOrders = ordersWithData.filter(
    (o) => o.items.length === 0
  ).length;
  const missingEvents = ordersWithData.filter(
    (o) => o.statusEvents.length === 0
  ).length;

  const pass = orphanedOrders === 0 && missingEvents === 0;
  console.log(
    `  ${pass ? "PASS" : "FAIL"} (${orphanedOrders} orders without items, ${missingEvents} orders without events)`
  );

  return { orphanedItems: orphanedOrders, missingEvents, pass };
}

// --- Cleanup ---

async function cleanup() {
  console.log("\n--- Cleanup ---");

  const testOrders = await db.query.orders.findMany({
    where: sql`${orders.customerInfo}->>'email' LIKE ${`${TEST_EMAIL_PATTERN}%${TEST_EMAIL_DOMAIN}`}`,
    columns: { id: true },
  });
  const testIds = testOrders.map((o) => o.id);

  let deleteCount = 0;
  if (testIds.length > 0) {
    const deleted = await db.delete(orders).where(inArray(orders.id, testIds));
    deleteCount = deleted.rowCount ?? testIds.length;
  }

  console.log(
    `  Deleted ${deleteCount} test orders (cascade removes items + events)`
  );
}

// --- Main ---

async function main() {
  console.log("=== Order Stress Test ===\n");
  console.log(`Database: ${DATABASE_URL?.replace(DB_URL_MASK_REGEX, ":***@")}`);

  const { store, product } = await findTestData();

  const { successes, failures, totalCollisions } = await testConcurrentOrders(
    store.id,
    product.id,
    product.priceCents
  );

  const idPass = await testIdUniqueness();
  const atomicity = await testAtomicity();

  await cleanup();

  // Summary
  console.log("\n=== Summary ===");
  console.log(`  Concurrent orders:   ${CONCURRENCY}`);
  console.log(`  Successful:          ${successes}`);
  console.log(`  Failed:              ${failures}`);
  console.log(`  Collisions (retry):  ${totalCollisions}`);
  console.log(`  Atomicity check:     ${atomicity.pass ? "PASS" : "FAIL"}`);
  console.log(`  ID uniqueness:       ${idPass ? "PASS" : "FAIL"}`);

  const allPassed = failures === 0 && atomicity.pass && idPass;
  console.log(`\n  Overall: ${allPassed ? "PASS" : "FAIL"}`);
  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error("Stress test crashed:", err);
  process.exit(1);
});
