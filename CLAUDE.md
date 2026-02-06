# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pekáreň Kromka - Online store and blog for a bakery chain in eastern Slovakia. Pick-up system where customers order online and collect at stores. B2B segment has delivery and invoicing.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # Check with Ultracite (Biome-based)
pnpm lint:fix     # Auto-fix lint issues
pnpm format:fix   # Format code
pnpm typecheck    # TypeScript check
pnpm db:push      # Push schema to database
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio
```

## Tech Stack

- Next.js 16 (App Router, React Compiler, typed routes)
- React 19
- PostgreSQL (Neon) + Drizzle ORM
- Better-auth (magic link, Google OAuth, organizations)
- Tailwind CSS + shadcn/ui + Radix primitives
- Zod for validation
- Vercel Blob for images

## Architecture

### Route Groups
- `src/app/(public)/` - Customer-facing pages (shop, checkout, profile, blog)
- `src/app/(admin)/admin/` - Admin dashboard
- `src/app/api/` - API routes (auth, webhooks)

### Feature Modules (`src/features/`)
Domain-specific business logic organized by feature with clear server/client separation:

**Core features:**
- `cart/` - Cookie-based cart with server actions
- `checkout/` - Order creation, pickup date logic ([docs](docs/features/checkout.md))
- `products/`, `categories/`, `stores/`, `orders/`, `favorites/`

**B2B features (`b2b/`):**
- `applications/` - B2B application management
- `clients/` - B2B client management
- `invoices/` - Invoice generation and management
- `price-tiers/` - B2B pricing tiers

**Standalone features:**
- `admin-dashboard/` - Admin metrics and dashboard queries
- `b2b-request/` - B2B application form submission
- `contact-form/` - Support request form
- `media-library/` - Image upload and management
- `site-config/` - Site-wide settings (orders_enabled, etc.)
- `user-management/` - Admin user queries
- `user-profile/` - User profile updates

Each feature contains an `api/` subfolder for server-side code:
- `api/actions.ts` - Server actions (mutations with `"use server"`)
- `api/queries.ts` - Database queries (cached with `"use cache"`)
- `schema.ts` - Zod validation schemas (at feature root)
- `components/` - Feature-specific components
- `hooks/` - Custom React hooks (for complex features)

### Shared Code
- `src/lib/auth/` - Better-auth setup (`server.ts`), guards (`guards.ts`), client (`client.ts`), session utilities
- `src/lib/` - Shared utilities (email, pricing, geo-utils, ids)
- `src/components/` - Shared UI components
- `src/db/` - Drizzle schema (`schema.ts`), types, migrations
- `src/store/` - Zustand stores

### Database Schema (`src/db/schema.ts`)
Key entities: users, organizations (B2B), products, categories, orders, orderItems, stores, carts, invoices, posts (blog), promoCodes, priceTiers (B2B pricing)

IDs use prefixed CUIDs: `prod_`, `ord_`, `cat_`, `sto_`, etc.

## Database (Neon HTTP)

This project uses Neon's **HTTP serverless driver** (`@neondatabase/serverless` + `drizzle-orm/neon-http`). This driver does NOT support interactive transactions (`db.transaction()` will fail).

**Instead of transactions, use:**
- Sequential DB calls with defensive ordering (most critical/irreversible operation last)
- Idempotency checks and guard clauses to prevent duplicate operations
- Application-level status checks before mutations (e.g., verify current state before updating)
- Unique constraints in the DB schema as a safety net for race conditions

**DO NOT use `db.transaction()` or `db.batch()` — they are not supported by the Neon HTTP driver.**

## Caching (cacheComponents)

This project uses Next.js 16's `cacheComponents: true` - an opt-in caching model that replaces the old implicit caching behavior.

**How it works:**
- Data fetching runs at runtime by default (fresh data)
- Use `"use cache"` directive to explicitly cache pages, components, or functions
- Use `cacheLife()` to configure cache duration
- Use `cacheTag()` to tag cached content for invalidation with `updateTag()`

```typescript
// Cached query example
"use cache";
import { cacheLife, cacheTag } from "next/cache";

export async function getProducts() {
  cacheLife("hours");
  cacheTag("products");
  return db.query.products.findMany();
}
```

This allows mixing static cached content with dynamic fresh data in the same route.

## Patterns

### Server Actions
Use `"use server"` directive. Wrap admin actions with `await requireAdmin()`. Invalidate cache with `updateTag()`.

```typescript
export async function updateProductAction({ id, product }: { id: string; product: UpdateProductSchema }) {
  await requireAdmin();
  // ... update logic
  updateTag("products");
  return { success: true };
}
```

### Authentication & Route Protection

Admin routes are protected at two levels:
- **Middleware (`src/proxy.ts`)** — Guards all `/admin/*` page navigation. Checks session role and redirects non-admins to `/prihlasenie`. This only protects page loads, NOT server actions.
- **Server action guards (`requireAdmin()`, `requireAuth()`)** — Every server action that mutates data must call the appropriate guard. Middleware does NOT protect server actions, so these guards are always required.

**DO NOT add `requireAdmin()` to admin layouts or pages** — the middleware already handles route protection, and calling auth guards in layouts/pages causes build failures (uncached data outside Suspense in Next.js 16 PPR).

Auth guards (`src/lib/auth/guards.ts`):
- `requireAdmin()` — Admin-only server actions
- `requireAuth()` — Any authenticated user (favorites, profile, comments)
- `requireStaff()` — Admin or manager role
- `requireB2bMember()` — B2B organization members

### Components
- Server Components by default
- `"use client"` only when needed (event handlers, browser APIs, client state)
- Use `next/image`, `next/link`
- shadcn/ui components in `src/components/ui/`

### Styling
Tailwind CSS with mobile-first approach. Use `cn()` utility for conditional classes. Dark mode ready.

### Forms
React Hook Form + Zod + shadcn form components. Validation schemas in feature `schema.ts` files.

## Linting (Ultracite/Biome)

This project uses Ultracite, a zero-config Biome preset. Key rules:
- Use `for...of` over `.forEach()`
- Use `const` by default, `let` only when needed
- Arrow functions for callbacks
- Optional chaining (`?.`) and nullish coalescing (`??`)
- Remove `console.log` and `debugger` from production

### IMPORTANT: No Barrel Files

**DO NOT create `index.ts` files that re-export from other modules.** This applies to:
- Feature modules (no `src/features/posts/index.ts`)
- Component folders (no `src/components/ui/index.ts`)
- Any directory that would use `export * from` pattern

Instead, import directly from the specific file:
```typescript
// ✅ Correct - direct imports
import { getProducts } from "@/features/products/api/queries";
import { updateProductAction } from "@/features/products/api/actions";

// ❌ Wrong - barrel file imports
import { getProducts, updateProductAction } from "@/features/products";
```

Barrel files hurt tree-shaking, increase bundle size, and slow down builds.

## Conventions

- Conventional commits: `type(scope): subject`
- Slovak language for user-facing content, English for code
- Price values stored as cents (integers)
- Dates: pickup dates as `YYYY-MM-DD` strings

## Documentation

All documentation is centralized in the `/docs` directory:

- `docs/database-schema.md` - Database schema reference
- `docs/product-management.md` - Product management guide
- `docs/features/` - Feature-specific documentation

See [docs/README.md](docs/README.md) for a complete index.
