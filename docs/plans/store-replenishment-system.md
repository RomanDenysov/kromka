# Store Replenishment & Internal Logistics System

> **Status:** Planning / Future
> **Date:** 2026-02-06

## Overview

Transform the platform into a mini ERP where the bakery/warehouse is the hub and stores are both B2B clients (placing daily replenishment orders) and B2C fulfillment points (customer pickup locations).

## Three Order Flows

1. **B2C order** — customer -> store (pickup). Already exists.
2. **B2B order** — external business -> delivery. Already implemented (separate checkout at `/b2b/pokladna`).
3. **Store replenishment order** — store -> warehouse (daily). **New concept.**

## Core Concept

Each physical store functions like an internal B2B customer, placing daily orders to the central warehouse/bakery. B2C customer orders automatically feed into the store's daily replenishment order. Store employees can add extra items manually. The warehouse sees aggregated orders per store per day.

### Payment & Balance Tracking

- **Cash payments** (customer pays on pickup) -> added to store balance
- **Card payments** -> tracked separately, do NOT add to store balance
- **End of period** (e.g., monthly) -> generate reconciliation report per store

## Data Model

### New Tables

```
storeOrders (daily store -> warehouse replenishment)
  id              -- prefixed CUID (e.g., "sord_...")
  storeId         -- FK to stores
  date            -- delivery date (unique per store+date)
  status          -- "draft" | "confirmed" | "dispatched" | "delivered"
  confirmedBy     -- userId of store employee who confirmed
  confirmedAt     -- timestamp
  notes           -- optional text
  createdAt
  updatedAt

storeOrderItems
  id
  storeOrderId    -- FK to storeOrders
  productId       -- FK to products
  quantity
  source          -- "b2c_auto" | "manual" | "standing"
  sourceOrderId   -- nullable FK to orders (links back to customer order if auto-added)

storeLedger (financial tracking per store per period)
  id
  storeId         -- FK to stores
  period          -- string like "2026-01", "2026-02"
  cashReceived    -- sum of cash B2C payments (cents)
  cardReceived    -- sum of card B2C payments (cents)
  goodsReceivedCents  -- wholesale value of deliveries received
  status          -- "open" | "closed" | "reconciled"
  createdAt
  updatedAt
```

### Existing Tables (no changes needed)

- `orders` — stays as-is for customer-facing orders (B2C + external B2B)
- `stores` — could add a type/flag to distinguish internal store from external B2B client, or use the existing `organizations` table relationship
- `organizations` — external B2B clients only

## Flow

```
Customer places B2C order (pickupDate: Jan 15, storeId: "sto_abc")
                |
                v
System finds/creates storeOrder for sto_abc + Jan 15
                |
                v
Auto-adds order items to storeOrderItems (source: "b2c_auto")
                |
                v
Store employee sees it in their calendar dashboard
                |
                v
Store employee can add extra items manually (source: "manual")
                |
                v
Warehouse confirms & dispatches the aggregated storeOrder
                |
                v
When B2C customer picks up & pays cash -> storeLedger.cashReceived += amount
When B2C customer pays by card -> storeLedger.cardReceived += amount
                |
                v
End of month: generate report from storeLedger + storeOrders
```

## Implementation Notes

### Route Structure

Store employees need their own dashboard — not admin, not customer. Consider:

```
src/app/(store)/          -- store employee dashboard
  dashboard/              -- overview, today's orders
  calendar/               -- order timeline view
  orders/[date]/          -- daily order detail
  reports/                -- monthly reports
```

With a `requireStoreEmployee()` auth guard.

### Auto-Aggregation

When a B2C order is persisted (`persistOrder` in `internal.ts`):
1. If `storeId` and `pickupDate` are set, upsert `storeOrders` for that store+date
2. Add each order item to `storeOrderItems` with `source: "b2c_auto"` and `sourceOrderId`
3. This should be a side effect in the order creation flow

### Monthly Reports

- Query `storeOrders` for the period to get goods received
- Query `storeLedger` for cash/card breakdown
- Query `orders` joined with `orderItems` for customer order detail
- Generate a summary snapshot (could be a materialized view or a generated PDF/export)

### Standing Orders

Future enhancement: stores can define recurring base inventory (e.g., "every Tuesday: 50 whole wheat, 30 rye"). These auto-populate `storeOrderItems` with `source: "standing"` and can be adjusted before confirmation.

## Architecture Decisions

- **Separate `storeOrders` table** (NOT reusing `orders`) because:
  - Different lifecycle: aggregated -> confirmed -> dispatched -> delivered
  - Different actors: store employees + warehouse staff
  - Different granularity: one per store per day vs many customer orders per day
  - Items come from multiple sources (auto B2C + manual + standing)

- **Single `orders` table** remains correct for all customer-facing orders (B2C + external B2B), discriminated by `companyId` (null = B2C, non-null = B2B)

- **`storeLedger`** is separate from order data to cleanly track financial reconciliation without complex joins

## Dependencies

- Current B2B/B2C separation (completed)
- Store employee role/auth guard
- Store dashboard UI
