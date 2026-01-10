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
Domain-specific logic organized by feature:
- `auth/` - Better-auth setup (`server.ts`), guards (`guards.ts`), client (`client.ts`)
- `cart/` - Cookie-based cart with server actions
- `checkout/` - Order creation, pickup date logic
- `products/`, `categories/`, `stores/`, `orders/`, `favorites/`

Each feature typically contains:
- `actions.ts` - Server actions (mutations)
- `queries.ts` - Database queries
- `schema.ts` - Zod validation schemas
- `components/` - Feature-specific components

### Shared Code
- `src/lib/` - Utilities, email templates, remaining queries/actions being migrated to features
- `src/components/` - Shared UI components
- `src/db/` - Drizzle schema (`schema.ts`), types, migrations
- `src/validation/` - Shared Zod schemas
- `src/store/` - Zustand stores

### Database Schema (`src/db/schema.ts`)
Key entities: users, organizations (B2B), products, categories, orders, orderItems, stores, carts, invoices, posts (blog), promoCodes, priceTiers (B2B pricing)

IDs use prefixed CUIDs: `prod_`, `ord_`, `cat_`, `sto_`, etc.

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
- Avoid barrel files (index re-exports)

## Conventions

- Conventional commits: `type(scope): subject`
- Slovak language for user-facing content, English for code
- Price values stored as cents (integers)
- Dates: pickup dates as `YYYY-MM-DD` strings
