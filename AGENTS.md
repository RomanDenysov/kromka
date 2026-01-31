# AGENTS.md

Guidelines for AI agents working on the Kromka codebase.

## Project

Next.js 16 bakery e-commerce with React 19, TypeScript, PostgreSQL (Drizzle), Tailwind, shadcn/ui.

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm typecheck        # TypeScript check
pnpm lint             # Check with Ultracite (Biome)
pnpm lint:fix         # Auto-fix lint issues
pnpm format:fix       # Format code

# Database
pnpm db:push          # Push schema changes
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
```

**No test framework is currently configured.**

## Code Style (Ultracite/Biome)

**Imports & Exports:**

- NO barrel files (`index.ts` re-exports) - import directly from specific files
- Use `for...of` over `.forEach()`
- Prefer arrow functions for callbacks

**Types:**

- Use `const` by default, `let` only when needed
- Prefer `unknown` over `any`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Explicit return types on exported functions when helpful

**Naming:**

- Components: PascalCase (e.g., `ProductCard.tsx`)
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE or camelCase
- File names: kebab-case for utilities, PascalCase for components

**Error Handling:**

- Use `try-catch` meaningfully; prefer early returns
- Throw `Error` objects with descriptive messages

**Logging:**

- Use logger from `@/lib/logger.ts` instead of `console.log`
- Use `log.{module}` for module logs (e.g., `log.orders`, `log.auth`)
- Use `createRequestLogger(module, context)` for request-scoped logging

**React/Next.js:**

- Server Components by default
- Add `"use client"` only for event handlers, browser APIs, client state
- Add `"use server"` for server actions
- Add `"use cache"` for cached queries (use with `cacheLife()` and `cacheTag()`)
- Use Next.js `<Image>` and `<Link>` components
- React 19: use `ref` as prop (no `forwardRef`)

## Architecture

**Feature Modules** (`src/features/{name}/`):

```
api/
  queries.ts      # "use cache" for public, no cache for admin
  actions.ts      # "use server" with auth guards
schema.ts         # Zod validation
components/       # Feature-specific components
hooks/            # Custom React hooks
```

**Route Groups:**

- `src/app/(public)/` - Customer-facing pages
- `src/app/(admin)/admin/` - Admin dashboard
- `src/app/api/` - API routes

**Auth:**

- Wrap admin actions with `await requireAdmin()` from `@/lib/auth/guards`

**Caching (Next.js 16):**

- Use `updateTag("tag-name")` from `next/cache` to invalidate cached queries after mutations
- Example: `updateTag("products")` after updating a product

## Conventions

- **Imports:** Use `@/` path alias (e.g., `@/features/products/api/queries`)
- **Language:** Slovak for user-facing content, English for code
- **Prices:** Store as cents (integers)
- **Dates:** Pickup dates as `YYYY-MM-DD` strings
- **IDs:** Prefixed CUIDs (`prod_`, `ord_`, `cat_`, `sto_`)
- **Commits:** Conventional format: `type(scope): subject`

## Styling

- Tailwind CSS with mobile-first approach
- Use `cn()` utility for conditional classes
- shadcn/ui components in `src/components/ui/`
- Dark mode ready

## Forms

- React Hook Form + Zod validation
- Validation schemas in feature `schema.ts` files

## Documentation

Reference docs in `docs/` directory:

- `docs/database-schema.md` - Database tables, relationships, patterns
- `docs/product-management.md` - Product admin guide
- `docs/features/` - Feature-specific documentation (checkout, b2b)

## Pre-commit Checklist

- [ ] Run `pnpm lint:fix`
- [ ] Run `pnpm typecheck`
- [ ] Remove debug statements
