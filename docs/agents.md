# AI Agent Guidelines

Instructions for AI assistants (Claude, Cursor, Copilot, etc.) working on this codebase.

## Critical Rules

### 1. No Barrel Files

**NEVER create `index.ts` files that re-export from other modules.**

This is enforced by Ultracite/Biome and affects tree-shaking and build performance.

```typescript
// ✅ CORRECT - Direct imports
import { getProducts } from "@/features/products/api/queries";
import { updateProductAction } from "@/features/products/api/actions";
import { productSchema } from "@/features/products/schema";

// ❌ WRONG - Barrel file imports (DO NOT CREATE THESE)
import { getProducts, updateProductAction, productSchema } from "@/features/products";
```

**Applies to:**
- Feature modules (`src/features/*/`)
- Component directories (`src/components/*/`)
- Any folder structure

### 2. Feature Module Structure

When creating a new feature, use this structure:

```
src/features/{feature-name}/
├── api/
│   ├── queries.ts    # Database read operations
│   └── actions.ts    # Server actions (mutations)
├── schema.ts         # Zod validation schemas
├── components/       # Feature-specific components (optional)
└── hooks/            # Custom hooks (optional)
```

**DO NOT add an `index.ts` file.**

### 3. Server/Client Patterns

**Queries (api/queries.ts):**
```typescript
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";

// Public queries - cached
export const getItems = cache(async () => {
  "use cache";
  cacheLife("hours");
  cacheTag("items");
  return db.query.items.findMany();
});

// Admin queries - no cache
export async function getAdminItems() {
  return db.query.items.findMany();
}
```

**Actions (api/actions.ts):**
```typescript
"use server";
import { updateTag } from "next/cache";
import { requireAdmin, requireAuth } from "@/lib/auth/guards";

export async function updateItemAction({ id, data }) {
  await requireAdmin();
  // ... update logic
  updateTag("items");
  return { success: true };
}
```

### 4. Import Conventions

Always use direct imports:

```typescript
// Database
import { db } from "@/db";
import { posts, users } from "@/db/schema";

// Auth guards
import { requireAdmin, requireAuth } from "@/lib/auth/guards";

// Feature queries/actions - DIRECT imports
import { getProducts } from "@/features/products/api/queries";
import { updateProductAction } from "@/features/products/api/actions";

// Schemas
import { productSchema } from "@/features/products/schema";
```

### 5. Cache Invalidation

Use `updateTag()` to invalidate related caches:

```typescript
updateTag("posts");           // All posts
updateTag("post-{slug}");     // Specific post
updateTag("tags");            // All tags
updateTag("comments");        // All comments
```

## Reference Files

When implementing new features, reference these existing patterns:

- **Queries:** `src/features/products/api/queries.ts`
- **Actions:** `src/features/products/api/actions.ts`
- **Schemas:** `src/features/products/schema.ts`
- **Toggle pattern:** `src/features/favorites/api/actions.ts`
- **Components:** `src/features/products/components/`

## Configuration Files

- `CLAUDE.md` - Main project documentation
- `.cursorrules` - Cursor-specific rules
- `.cursor/rules/` - Detailed formatting rules
- `biome.json` - Linting configuration
