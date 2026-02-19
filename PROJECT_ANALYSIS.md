# Project Analysis — Pekáreň Kromka

> Generated: 2026-02-08 | Based on codebase audit of all routes, features, schema, and configuration.

---

## 1. Project Overview

**Pekáreň Kromka** is an online store and blog for a bakery chain in eastern Slovakia. It serves two distinct customer segments:

- **B2C** — Individual customers browse products, place pickup orders (no delivery), and collect at physical stores. Payment is in-store or by card.
- **B2B** — Business clients (restaurants, hotels, cafes, shops) apply for accounts, get organization-level pricing tiers, order with invoice payment, and receive delivery.

**Business model**: Pick-up system — customers order online, select a store and pickup date/time, and collect in person. B2B clients additionally get delivery and invoicing with configurable payment terms.

**Users**:
- **Customers** (B2C): Browse shop, manage favorites, place orders, read blog
- **B2B members**: Separate shop with tier pricing, invoice payment, delivery
- **Admins**: Full dashboard with metrics, order/product/store/user management, blog CMS, B2B client management

**Language**: All user-facing content is in Slovak. Code is in English.

---

## 2. Tech Stack & Architecture Decisions

### Core Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.1 (App Router, React Compiler, typed routes) |
| UI | React 19, Tailwind CSS v4 (CSS-first), shadcn/ui, Radix primitives |
| Database | PostgreSQL (Neon HTTP serverless) + Drizzle ORM |
| Auth | Better-auth (magic link + Google OAuth, organizations) |
| Validation | Zod 4 |
| Storage | Vercel Blob (images processed with Sharp) |
| Email | React Email templates + Nodemailer |
| Analytics | Vercel Analytics, PostHog |
| Logging | Pino (structured, module-scoped) |
| Rich text | TipTap/ProseMirror (JSON content stored in DB) |

### Key Architecture Decisions

1. **Neon HTTP driver** — Chosen for serverless/edge compatibility. Trade-off: **no interactive transactions** (`db.transaction()` not supported). Uses sequential calls with defensive ordering instead.

2. **`cacheComponents: true`** (Next.js 16) — Opt-in caching model. Data is fresh by default; explicit `"use cache"` + `cacheLife()` + `cacheTag()` for caching. Invalidation via `updateTag()`.

3. **Feature-module architecture** (`src/features/`) — Domain-specific business logic with clear server/client separation. Each feature has `api/actions.ts` (mutations), `api/queries.ts` (cached reads), `schema.ts` (Zod), and optional `components/`/`hooks/`.

4. **Cookie-based cart** — No DB cart for guests. Cart stored in httpOnly cookies (`krmk-kosik`, `krmk-kosik-b2b`) with 30-day expiry.

5. **Prefixed CUID2 IDs** — All business entities use `{prefix}-{cuid2}` format (e.g., `prod-`, `ord-`, `cat-`). Auth tables use plain IDs from better-auth.

6. **Cents-based pricing** — All monetary values stored as integers. DB CHECK constraints enforce non-negative values.

7. **B2C/B2B channel flags** — Products and categories use `showInB2c`/`showInB2b` booleans rather than a separate channel table. B2B pricing via `priceTiers` + `prices` junction table.

8. **Result type pattern** (`src/lib/pipeline.ts`) — `StepResult<T>` with `guard()`, `unwrap()`, `runPipeline()` for server action error handling.

9. **Cross-subdomain auth** — Production cookies scoped to `.pekarenkromka.sk` domain for subdomain sharing.

### Route Groups
- `(public)/` — Customer-facing: shop, checkout, profile, blog, B2B
- `(admin)/admin/` — Admin dashboard (protected by middleware + server action guards)
- `api/` — Auth handler, cart API

---

## 3. Feature Inventory

### Fully Implemented

| Feature | Description | Notable Details |
|---------|-------------|-----------------|
| **Products** | Full CRUD, draft/active/sold/archived statuses, B2B/B2C flags | Slug uniqueness checks, copy with prices |
| **Categories** | Full CRUD, featured categories, B2B/B2C flags, pickup dates | Flat structure (was hierarchical, simplified in migration 0005) |
| **Cart** | B2C + B2B cart with cookie persistence | 8 components, quantity limits (999), tier pricing in B2B cart |
| **Checkout (B2C)** | Full order flow with pickup scheduling | Cutoff at 12:00, store schedule validation, form prefill from last order |
| **Checkout (B2B)** | Separate B2B flow with invoice payment + delivery | Org billing info, delivery address, `requireB2bMember()` guard |
| **Orders** | Pipeline-based creation, admin management, bulk operations | Status events audit trail, chunked email notifications, IDOR protection |
| **Blog** | Full CMS: posts, tags, comments, likes, sharing | TipTap editor, comment moderation (unpublished by default), related posts |
| **Stores** | Full CRUD, opening hours, map display | Haversine distance sorting, Apple/Google Maps links |
| **Favorites** | Toggle favorite, favorites list, "add all to cart" | Auth-required |
| **Media Library** | Upload with Sharp processing, admin gallery | 10MB limit, resize to 1600px, JPEG 85% mozjpeg |
| **B2B Applications** | Submit, approve (creates org + invitation), reject | Atomic status claims to prevent race conditions |
| **B2B Clients** | Organization management with billing details | Price tier assignment, member listing |
| **B2B Invoices** | Generate, issue, mark paid | VS-YYYY-NNNN numbering with collision retry, links orders |
| **Contact Form** | Support request with confirmation email | Contextual metadata (source path, user agent, PostHog ID) |
| **Site Config** | Toggle system flags (orders_enabled, registration, promo banner) | Upsert with allowlisted keys |
| **User Profile** | Profile editing, order history | Auto-sync from checkout data |
| **Admin Dashboard** | 12+ metric sections, charts, alerts | Revenue, retention, seasonal trends, store load, unused products |
| **Auth** | Magic link + Google OAuth, admin/manager/user roles | Cross-subdomain cookies, org-based B2B auth |
| **B2B Price Tiers** | Full CRUD: create/update/delete tiers, set/remove/bulk-set product prices, detail page with inline editing | Spec in `docs/specs/b2b-price-tiers-crud.md` |
| **Email** | 11 React Email templates | Order lifecycle, B2B notifications, magic link, support |

### Partially Implemented

| Feature | What's Missing | Impact |
|---------|---------------|--------|
| **User Management** | Read-only queries — no actions for role change, ban, unlock | Admin can view users but can't manage them through the UI |
| **Promo Codes** | Schema exists in DB, referenced in dashboard metrics, but **no feature module** for CRUD | Admin has no UI to create/manage promo codes |

### Stub/Placeholder Pages

All previously identified stub pages have been removed (see cleanup PR #13).

### Notable Missing Pieces

- **Payment gateway integration** — No online payment processing. `paymentMethod: "card"` exists as an option but there's no Stripe/payment provider. TODO in export utils: "Add payment status info after payment provider integration"
- **B2B approval/rejection emails** — Marked as TODO in `b2b/applications/api/actions.ts` (lines 192, 253)
- **User lock/ban UI** — TODO in users table component (line 74)
- **Blog link in header** — Commented out with TODO: "add blog back when it's ready"
- **HTML→JSON conversion** — `htmlToJsonContent()` in `editor-utils.ts` is a stub returning null
- **Reviews** — DB table exists with full schema (rating, title, content, verified purchase, moderation) but no feature module or UI
- **Speed Insights** — Removed with TODO: "add back when we have a better way to measure performance"

---

## 4. Data Model

### Entity Map (31 tables)

**Auth (7 tables):** users, sessions, accounts, verifications, organizations, members, invitations

**Products & Catalog (5 tables):** products, product_images, categories, media, prices + price_tiers

**Orders & Payments (4 tables):** orders, order_items, order_status_events, invoices

**Cart (2 tables):** carts, cart_items

**Promo (2 tables):** promo_codes, promo_code_usages

**Blog (4 tables):** posts, post_tags, post_to_tags, post_comments

**Social (3 tables):** favorites, reviews, post_likes

**B2B (1 table):** b2b_applications

**Other (2 tables):** stores, site_settings

### Key Relationships

```
users ──┬── orders (createdBy)
        ├── favorites ──── products
        ├── reviews ──── products
        ├── post_likes ──── posts
        ├── post_comments ──── posts
        └── members ──── organizations ──── price_tiers
                                       └── invoices ──── orders

products ──┬── categories (many-to-one)
           ├── product_images ──── media
           ├── order_items ──── orders
           ├── cart_items ──── carts
           └── prices ──── price_tiers

posts ──┬── post_to_tags ──── post_tags
        ├── post_comments (self-referencing for nesting)
        └── post_likes

orders ──── order_items
       ──── order_status_events
       ──── promo_code_usages ──── promo_codes
```

### Enum Types
- **UserRole**: admin | manager | user
- **OrderStatus**: new | in_progress | ready_for_pickup | completed | cancelled | refunded
- **PaymentStatus**: pending | paid | failed | refunded
- **PaymentMethod**: in_store | card | invoice | other
- **InvoiceStatus**: draft | issued | sent | paid | void
- **ProductStatus**: draft | active | sold | archived
- **PostStatus**: draft | published | archived
- **B2bApplicationStatus**: pending | approved | rejected
- **PromoType**: percentage | fixed_amount | free_shipping

### Design Patterns
- **Cents-based pricing** with CHECK constraints (non-negative)
- **JSONB for flexible data**: Address, StoreSchedule, TipTap JSONContent, product snapshots in order_items, pickup dates arrays
- **Order snapshots**: `order_items.productSnapshot` captures name/price at order time
- **Audit trail**: `order_status_events` tracks all status changes with who/when/note
- **Moderation flags**: `reviews.isPublished` and `post_comments.isPublished` default to false
- **Slug uniqueness**: All sluggable entities have unique constraints, generated with 8-char CUID2 suffix

---

## 5. Known Limitations & Technical Debt

### Critical Architecture Constraints

1. **No DB transactions** — Neon HTTP driver doesn't support `db.transaction()` or `db.batch()`. Mitigated by defensive ordering, idempotency checks, and atomic WHERE clauses.

2. **Middleware only protects page loads** — `src/proxy.ts` guards `/admin/*` navigation but NOT server actions. Every server action must independently call `requireAdmin()`/`requireAuth()`.

### Documentation Drift — `docs/database-schema.md`

The database documentation is significantly outdated. Specific discrepancies:

| docs/database-schema.md describes | Actual implementation |
|---|---|
| `product_categories` junction table | `products.categoryId` FK (one category per product) |
| `product_channels` table | `showInB2c`/`showInB2b` boolean flags on products |
| `order_payments` + `payment_refunds` tables | `paymentStatus`/`paymentMethod` fields on orders |
| `deliveries` table | `deliveryAddress` JSONB on orders |
| `invoice_items` table | Invoices link directly to orders (period-based) |
| `category_availability_windows` table | `pickupDates` JSONB array on categories |
| `store_members` table | Does not exist |
| `sku`, `stock`, `archivedAt`, `deletedAt` on products | None exist |
| Complex pricing model (channel, orgId, minQty, priority, date ranges) | Simple priceTier-based pricing |

### TODOs in Code

| Location | Issue |
|----------|-------|
| `src/features/b2b/applications/api/actions.ts:192` | Send approval email with invitation link |
| `src/features/b2b/applications/api/actions.ts:254` | Send rejection email |
| `src/components/tables/orders/export-order-utils.ts:60` | Add payment status after payment provider integration |
| `src/components/tables/users/users-table.tsx:74` | Implement user lock functionality |
| `src/app/layout.tsx:37` | Re-add speed insights |
| `src/lib/auth/guards.ts:23` | Check redirect vs unauthorized behavior |
| `src/lib/auth/session.ts:33` | Check what to get from members table |
| `src/db/index.ts:7` | Fix namespace import (biome-ignore) |

### Other Observations

- **No `.env.example`** — Environment variables only documented via Zod schema in `src/env.ts`
- **Blog nav link** — Gated behind `featureFlags.blog` (currently `false`), ready to enable
- **Email recipients hardcoded** — Staff notifications go to hardcoded addresses (kromka@kavejo.sk + developer email)
- **No online payment processing** — Card payment option exists in UI but no payment gateway is integrated
- **Reviews table unused** — Full schema exists but no feature module, actions, or UI
- **Easter egg game** — Physics-based game exists in `src/lib/game/` and `src/components/game/`

---

## 6. Async/Waterfall Analysis — Vercel React Best Practices

**Analysis Date:** 2026-02-19
**Scope:** Next.js App Router server components and API routes for async patterns

### Overview

The codebase demonstrates **good understanding of async patterns** with several correctly implemented `Promise.all()` calls for parallelization. However, **3 critical waterfall patterns** were identified that create unnecessary sequential queries, adding latency to critical user paths.

**Key Finding:** Sequential database queries in blog/post filtering, order confirmation IDOR checks, and admin post counts create measurable waterfalls.

### ✅ Good Patterns Found

**Pattern 1: Checkout Page** `src/app/(public)/pokladna/page.tsx:37-46`
```typescript
const [items, stores, ordersEnabled, lastOrderPrefill] = await Promise.all([
  getDetailedCart(null),
  getStores(),
  getSiteConfig("orders_enabled"),
  getLastOrderPrefillAction(),
]);
```
✅ Independent queries parallelized; dependent computation after.

**Pattern 2: Admin Dashboard** `src/app/(admin)/admin/(dashboard)/page.tsx:38-43`
```typescript
const [orders, recentOrders, products, monthlyStats] = await Promise.all([
  getOrdersByPickupDate(formattedDate),
  getRecentOrders(),
  getProductsAggregateByPickupDate(formattedDate),
  getMonthlyOrderStats(year, month),
]);
```
✅ All 4 queries independent, all parallelized.

**Pattern 3: Product Grid** `src/features/products/components/products-grid.tsx:18-21`
```typescript
const [allProducts, favoriteIds] = await Promise.all([
  getProducts(),
  getFavoriteIds(),
]);
```
✅ User favorites + product catalog load in parallel.

**Pattern 4: Blog Page** `src/app/(public)/blog/page.tsx:46-49`
```typescript
const [{ posts, total, totalPages }, tags] = await Promise.all([
  getPublishedPosts({ page, tag, search }),
  getAllTags(),
]);
```
✅ Blog content + tag filtering data fetched in parallel.

### 🔴 CRITICAL Issues

**Issue 1: Blog Post Tag Query Waterfall**
- **File:** `src/features/posts/api/queries.ts:92-107`
- **Problem:** Sequential tag lookup + posts-with-tag query
  - ROUND TRIP 1: Find tag by slug
  - ROUND TRIP 2: Find posts with this tag
  - Then count and fetch posts (3-4 more trips)
- **Fix:** Parallelize tag lookup and count
  ```typescript
  if (tag) {
    const [tagRecord, { total }] = await Promise.all([
      db.query.postTags.findFirst(...),
      db.select({ total: count() }).from(posts).where(...)
    ]);
  }
  ```
- **Impact:** -1 round trip (~30-50ms improvement)

**Issue 2: Admin Post List Count + Data Waterfall**
- **File:** `src/features/posts/api/queries.ts:337-358`
- **Problem:** Sequential count, then fetch (same conditions)
  - ROUND TRIP 1: Count posts matching conditions
  - ROUND TRIP 2: Fetch posts data
- **Fix:** Parallelize with `Promise.all()`
  ```typescript
  const [countResult, data] = await Promise.all([
    db.select({ total: count() }).from(posts).where(...),
    db.query.posts.findMany({...})
  ]);
  ```
- **Impact:** -1 round trip (~20-50ms improvement)

### 🟡 MEDIUM Issues

**Issue 3: Order Confirmation IDOR Check Waterfall**
- **File:** `src/app/(public)/pokladna/[orderId]/page.tsx:20-39`
- **Problem:** Sequential calls for security checks
  - ROUND TRIP 1: Get order
  - ROUND TRIP 2: Get session (independent)
  - ROUND TRIP 3 (guests only): Get last order ID
- **Fix:** Parallelize first two
  ```typescript
  const [order, session] = await Promise.all([
    getOrderById(orderId),
    getSession(),
  ]);
  ```
- **Impact:** -1 round trip for auth users (~20-30ms improvement)

### ℹ️ Informational

**Product Page Review Optimization** `src/app/(public)/product/[slug]/page.tsx:119, 141-144`
- **Note:** `getProducts()` called twice but React's `cache()` deduplicates calls within render
- **Status:** ✅ No action needed - caching working correctly

### Summary

| Priority | File | Issue | Gain |
|----------|------|-------|------|
| HIGH | `src/features/posts/api/queries.ts:92-107` | Blog tag waterfall | -1 RT, ~30-50ms |
| HIGH | `src/features/posts/api/queries.ts:337-358` | Admin post count waterfall | -1 RT, ~20-50ms |
| MEDIUM | `src/app/(public)/pokladna/[orderId]/page.tsx:20-39` | Order confirmation waterfall | -1 RT, ~20-30ms |

**Total estimated improvement:** ~70-130ms across affected pages
**Effort:** Low (3 simple `Promise.all()` refactors)
