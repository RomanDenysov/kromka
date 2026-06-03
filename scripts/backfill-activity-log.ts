/**
 * Backfill script: order_status_events → activity_log
 *
 * Seeds the cross-entity activity feed with historical order events so the
 * /admin/activity page and dashboard panel are not empty on launch. For each
 * order_status_event it writes one activity_log row, preserving the original
 * timestamp and deriving the actor role from the linked user.
 *
 * Mapping:
 *   status "new"       → order.created
 *   status "cancelled" → order.cancelled
 *   otherwise          → order.status_changed
 *   actor: admin/manager → staff, other user → customer, no user → system
 *
 * Idempotent: each row gets a deterministic id ("act-<eventId>") and is written
 * with onConflictDoNothing, so re-running never duplicates.
 *
 * Run with:
 *   pnpm dlx tsx scripts/backfill-activity-log.ts        # dev (default)
 *   pnpm dlx tsx scripts/backfill-activity-log.ts prod   # production
 */

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
// biome-ignore lint/performance/noNamespaceImport: scripts need the full schema
import * as schema from "../src/db/schema";
import {
  activityLog,
  orderStatusEvents,
  orders,
  users,
} from "../src/db/schema";
import type {
  ActivityAction,
  ActivityActorType,
  OrderStatus,
} from "../src/db/types";

const env = process.argv[2] || "dev";
const envFile = env === "prod" ? ".env.production" : ".env";

console.log(`🔧 Loading environment from: ${envFile}\n`);
config({ path: envFile });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle({ client: sql, schema });

const INSERT_CHUNK_SIZE = 200;

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Nová",
  in_progress: "Spracováva sa",
  ready_for_pickup: "Pripravená",
  completed: "Dokončená",
  cancelled: "Zrušená",
  refunded: "Vrátená",
};

function confirmProduction(): Promise<boolean> {
  if (env !== "prod") {
    return Promise.resolve(true);
  }
  return import("node:readline").then(
    (readline) =>
      new Promise<boolean>((resolve) => {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.question(
          "⚠️  Running on PRODUCTION. Type 'yes' to confirm: ",
          (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === "yes");
          }
        );
      })
  );
}

function deriveActor(
  createdBy: string | null,
  userRole: string | null,
  userName: string | null,
  status: OrderStatus
): {
  actorId: string | null;
  actorType: ActivityActorType;
  actorLabel: string | null;
} {
  if (!createdBy) {
    // A "new" event with no user is a guest checkout (customer, no account);
    // matches the live create-b2c-order path. Other statuses → system.
    return {
      actorId: null,
      actorType: status === "new" ? "customer" : "system",
      actorLabel: null,
    };
  }
  const isStaff = userRole === "admin" || userRole === "manager";
  return {
    actorId: createdBy,
    actorType: isStaff ? "staff" : "customer",
    actorLabel: userName,
  };
}

function deriveEvent(
  status: OrderStatus,
  orderNumber: string
): { action: ActivityAction; summary: string } {
  if (status === "cancelled") {
    return {
      action: "order.cancelled",
      summary: `Objednávka zrušená · #${orderNumber}`,
    };
  }
  if (status === "new") {
    return {
      action: "order.created",
      summary: `Nová objednávka · #${orderNumber}`,
    };
  }
  return {
    action: "order.status_changed",
    summary: `${ORDER_STATUS_LABELS[status]} · #${orderNumber}`,
  };
}

async function backfill() {
  const confirmed = await confirmProduction();
  if (!confirmed) {
    console.log("❌ Backfill cancelled");
    process.exit(0);
  }

  console.log(
    `🚀 Backfilling activity_log from order events (${env.toUpperCase()})...\n`
  );

  const events = await db
    .select({
      eventId: orderStatusEvents.id,
      orderId: orderStatusEvents.orderId,
      status: orderStatusEvents.status,
      note: orderStatusEvents.note,
      createdAt: orderStatusEvents.createdAt,
      createdBy: orderStatusEvents.createdBy,
      orderNumber: orders.orderNumber,
      userName: users.name,
      userRole: users.role,
    })
    .from(orderStatusEvents)
    .innerJoin(orders, eq(orderStatusEvents.orderId, orders.id))
    .leftJoin(users, eq(orderStatusEvents.createdBy, users.id))
    .orderBy(orderStatusEvents.createdAt);

  console.log(`📦 Found ${events.length} order status events\n`);

  const values = events.map((event) => {
    const actor = deriveActor(
      event.createdBy,
      event.userRole,
      event.userName,
      event.status
    );
    const { action, summary } = deriveEvent(event.status, event.orderNumber);
    return {
      id: `act-${event.eventId}`,
      actorId: actor.actorId,
      actorType: actor.actorType,
      actorLabel: actor.actorLabel,
      action,
      entityType: "order" as const,
      entityId: event.orderId,
      summary,
      metadata: {
        to: event.status,
        note: event.note,
        context: event.orderNumber,
      },
      createdAt: event.createdAt,
    };
  });

  let inserted = 0;
  for (let i = 0; i < values.length; i += INSERT_CHUNK_SIZE) {
    const chunk = values.slice(i, i + INSERT_CHUNK_SIZE);
    if (chunk.length === 0) {
      continue;
    }
    const result = await db
      .insert(activityLog)
      .values(chunk)
      .onConflictDoNothing({ target: activityLog.id })
      .returning({ id: activityLog.id });
    inserted += result.length;
    console.log(
      `   …processed ${Math.min(i + chunk.length, values.length)}/${values.length} (newly inserted: ${inserted})`
    );
  }

  console.log("\n📊 Backfill Summary:");
  console.log(`   📦 Source events:   ${events.length}`);
  console.log(`   ✅ Inserted:        ${inserted}`);
  console.log(`   ⏭️  Skipped (exists): ${events.length - inserted}`);
  console.log("\n✨ Done. Open /admin/activity to verify.");
}

backfill()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Backfill failed:", error);
    process.exit(1);
  });
