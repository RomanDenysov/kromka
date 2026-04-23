---
name: feature-scaffold
description: Scaffold a new feature module following the project's api/queries/actions/schema pattern
disable-model-invocation: true
---

# Feature Scaffold Skill

Create a new feature module in `src/features/` following the project's established patterns.

## Usage

The user provides the feature name and a brief description. Example: `/feature-scaffold promo-codes "Promo code management for discounts"`

## Arguments

- `$1` - Feature name in kebab-case (e.g., `promo-codes`)
- `$2` - Brief description (optional)

## Scaffold structure

Create the following files under `src/features/<name>/`:

### `api/queries.ts`
```typescript
"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
// import relevant tables from @/db/schema

export async function get<Name>s() {
  cacheLife("hours");
  cacheTag("<name>");
  // TODO: implement query
}
```

### `api/actions.ts`
```typescript
"use server";

import { updateTag } from "next/cache";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth/guards";
// import relevant tables and schemas

export async function create<Name>Action(input: Create<Name>Schema) {
  await requireAdmin();
  // TODO: implement mutation
  updateTag("<name>");
  return { success: true };
}
```

### `schema.ts`
```typescript
import { z } from "zod/v4";

export const create<Name>Schema = z.object({
  // TODO: define fields
});

export type Create<Name>Schema = z.infer<typeof create<Name>Schema>;
```

### `components/` directory
Create the directory but do not add placeholder files. Components are added as needed.

## After scaffolding

1. Run `pnpm typecheck` to verify no errors
2. Update `docs/features-catalog.json` with the new feature entry:
   - Add to the `features` array with: name, description, path, actions, queries, schemas, components, dependencies, routes, dbTables, cacheTags
   - Update the top-level `lastUpdated` field to today's date

## Conventions

- Use `"use cache"` for queries, `"use server"` for actions
- Auth guards: `requireAdmin()` for admin features, `requireAuth()` for user features
- Cache invalidation: `updateTag("<name>")` after mutations
- Zod v4 for validation schemas (`import { z } from "zod/v4"`)
- Direct imports only - no barrel files / `index.ts`
- IDs: use `createId("<prefix>")` from `@/lib/ids`
- Prices in cents (integers), dates as `YYYY-MM-DD` strings
- Logging: use `log.<module>` from `@/lib/logger`, not `console.log`
