# Feature Structure Reorganization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize project structure by moving lib/queries and lib/actions into feature-based organization with clear server/client separation via api/ folders.

**Architecture:** Move all business logic from src/lib/queries/ and src/lib/actions/ into granular feature modules. Each feature will have an api/ folder containing server-side code (actions.ts, queries.ts). Keep only infrastructure and pure utilities in src/lib/.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, Server Actions

---

## Phase 1: Create New Simple Features

### Task 1: Create contact-form Feature

**Files:**
- Create: `src/features/contact-form/api/actions.ts`
- Create: `src/features/contact-form/schema.ts`
- Move from: `src/lib/actions/contact.ts`
- Move from: `src/validation/contact.ts` (supportRequestSchema only)

**Step 1: Create directory structure**

```bash
mkdir -p src/features/contact-form/api
```

**Step 2: Create schema file**

Create `src/features/contact-form/schema.ts`:

```typescript
import z from "zod";

const MAX_SOURCE_PATH_LENGTH = 500;
const MAX_SOURCE_URL_LENGTH = 1000;
const MAX_SOURCE_REF_LENGTH = 100;
const MAX_USER_AGENT_LENGTH = 500;
const MAX_POSTHOG_ID_LENGTH = 200;

export const supportRequestSchema = z.object({
  name: z.string().trim().min(1, "Meno je povinné"),
  email: z.string().trim().email("Neplatná emailová adresa"),
  rootCause: z.string().trim().min(1, "Príčina problému je povinná"),
  message: z.string().trim().min(1, "Správa je povinná"),
  // Optional context fields
  sourcePath: z
    .string()
    .trim()
    .max(MAX_SOURCE_PATH_LENGTH)
    .optional()
    .or(z.undefined()),
  sourceUrl: z
    .string()
    .trim()
    .max(MAX_SOURCE_URL_LENGTH)
    .optional()
    .or(z.undefined()),
  sourceRef: z
    .string()
    .trim()
    .max(MAX_SOURCE_REF_LENGTH)
    .optional()
    .or(z.undefined()),
  userAgent: z
    .string()
    .trim()
    .max(MAX_USER_AGENT_LENGTH)
    .optional()
    .or(z.undefined()),
  posthogId: z
    .string()
    .trim()
    .max(MAX_POSTHOG_ID_LENGTH)
    .optional()
    .or(z.undefined()),
});

export type SupportRequestSchema = z.infer<typeof supportRequestSchema>;
```

**Step 3: Create actions file**

Create `src/features/contact-form/api/actions.ts`:

```typescript
"use server";

import { sendEmail } from "@/lib/email";
import { supportRequestSchema } from "../schema";

type SubmitSupportRequestResult =
  | { success: true }
  | { success: false; error: string };

export async function submitSupportRequest(data: {
  name: string;
  email: string;
  rootCause: string;
  message: string;
  sourcePath?: string;
  sourceUrl?: string;
  sourceRef?: string;
  userAgent?: string;
  posthogId?: string;
}): Promise<SubmitSupportRequestResult> {
  try {
    // Validate input with zod
    const validationResult = supportRequestSchema.safeParse(data);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { success: false, error: firstError?.message ?? "Neplatné údaje" };
    }

    const validatedData = validationResult.data;

    // Send email to staff (critical - must succeed)
    try {
      await sendEmail.supportRequest({
        name: validatedData.name,
        email: validatedData.email,
        rootCause: validatedData.rootCause,
        message: validatedData.message,
        sourcePath: validatedData.sourcePath,
        sourceUrl: validatedData.sourceUrl,
        sourceRef: validatedData.sourceRef,
        userAgent: validatedData.userAgent,
        posthogId: validatedData.posthogId,
      });
    } catch {
      return {
        success: false,
        error: "Nastala chyba pri odosielaní správy. Skúste to prosím znova.",
      };
    }

    // Send confirmation email to user (non-critical - failure doesn't affect success)
    try {
      await sendEmail.supportConfirmation({
        email: validatedData.email,
      });
    } catch {
      // ignore
    }

    return { success: true };
  } catch (_error) {
    return {
      success: false,
      error: "Nastala chyba pri odosielaní správy. Skúste to prosím znova.",
    };
  }
}
```

**Step 4: Update imports in consuming files**

Find files importing from `src/lib/actions/contact.ts`:

```bash
grep -r "from \"@/lib/actions/contact\"" src/ --include="*.ts" --include="*.tsx"
```

Expected: Will show files that need import updates

Update each file:
- Change: `from "@/lib/actions/contact"`
- To: `from "@/features/contact-form/api/actions"`

**Step 5: Verify no errors**

```bash
pnpm typecheck
```

Expected: No TypeScript errors

**Step 6: Commit**

```bash
git add src/features/contact-form/
git commit -m "feat: create contact-form feature with api structure"
```

---

### Task 2: Create user-profile Feature

**Files:**
- Create: `src/features/user-profile/api/queries.ts`
- Create: `src/features/user-profile/api/actions.ts`
- Move from: `src/lib/queries/profile.ts`
- Move from: `src/lib/actions/user-profile.ts`

**Step 1: Create directory structure**

```bash
mkdir -p src/features/user-profile/api
```

**Step 2: Create queries file**

Create `src/features/user-profile/api/queries.ts`:

```typescript
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { orders } from "@/db/schema";

export async function getUserOrders(userId: string) {
  "use cache";
  cacheLife("days");
  cacheTag("orders", `user-${userId}`);
  return await db.query.orders.findMany({
    where: eq(orders.createdBy, userId),
    with: {
      store: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
      items: {
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: (order, { desc }) => [desc(order.createdAt)],
  });
}

export type UserOrdersList = Awaited<ReturnType<typeof getUserOrders>>;
export type UserOrder = UserOrdersList[number];
```

**Step 3: Copy actions file**

Copy content from `src/lib/actions/user-profile.ts` to `src/features/user-profile/api/actions.ts`

```bash
cp src/lib/actions/user-profile.ts src/features/user-profile/api/actions.ts
```

**Step 4: Update imports**

Find and update imports:

```bash
grep -r "from \"@/lib/queries/profile\"" src/ --include="*.ts" --include="*.tsx"
grep -r "from \"@/lib/actions/user-profile\"" src/ --include="*.ts" --include="*.tsx"
```

Update:
- `from "@/lib/queries/profile"` → `from "@/features/user-profile/api/queries"`
- `from "@/lib/actions/user-profile"` → `from "@/features/user-profile/api/actions"`

**Step 5: Verify**

```bash
pnpm typecheck
```

**Step 6: Commit**

```bash
git add src/features/user-profile/
git commit -m "feat: create user-profile feature with api structure"
```

---

### Task 3: Create media-library Feature

**Files:**
- Create: `src/features/media-library/api/queries.ts`
- Create: `src/features/media-library/api/actions.ts`
- Move from: `src/lib/queries/media.ts`
- Move from: `src/lib/actions/media.ts`

**Step 1: Create directory structure**

```bash
mkdir -p src/features/media-library/api
```

**Step 2: Copy files**

```bash
cp src/lib/queries/media.ts src/features/media-library/api/queries.ts
cp src/lib/actions/media.ts src/features/media-library/api/actions.ts
```

**Step 3: Update imports in new files**

Review `src/features/media-library/api/actions.ts` and ensure all imports are correct.

**Step 4: Update imports in consuming files**

```bash
grep -r "from \"@/lib/queries/media\"" src/ --include="*.ts" --include="*.tsx"
grep -r "from \"@/lib/actions/media\"" src/ --include="*.ts" --include="*.tsx"
```

Update:
- `from "@/lib/queries/media"` → `from "@/features/media-library/api/queries"`
- `from "@/lib/actions/media"` → `from "@/features/media-library/api/actions"`

**Step 5: Verify**

```bash
pnpm typecheck
```

**Step 6: Commit**

```bash
git add src/features/media-library/
git commit -m "feat: create media-library feature with api structure"
```

---

### Task 4: Create user-management Feature

**Files:**
- Create: `src/features/user-management/api/queries.ts`
- Move from: `src/lib/queries/users.ts`

**Step 1: Create directory structure**

```bash
mkdir -p src/features/user-management/api
```

**Step 2: Copy file**

```bash
cp src/lib/queries/users.ts src/features/user-management/api/queries.ts
```

**Step 3: Update imports**

```bash
grep -r "from \"@/lib/queries/users\"" src/ --include="*.ts" --include="*.tsx"
```

Update:
- `from "@/lib/queries/users"` → `from "@/features/user-management/api/queries"`

**Step 4: Verify**

```bash
pnpm typecheck
```

**Step 5: Commit**

```bash
git add src/features/user-management/
git commit -m "feat: create user-management feature with api structure"
```

---

### Task 5: Create admin-dashboard Feature

**Files:**
- Create: `src/features/admin-dashboard/api/queries.ts`
- Create: `src/features/admin-dashboard/api/metrics.ts`
- Move from: `src/lib/queries/dashboard.ts`
- Move from: `src/lib/queries/dashboard-metrics.ts`

**Step 1: Create directory structure**

```bash
mkdir -p src/features/admin-dashboard/api
```

**Step 2: Copy files**

```bash
cp src/lib/queries/dashboard.ts src/features/admin-dashboard/api/queries.ts
cp src/lib/queries/dashboard-metrics.ts src/features/admin-dashboard/api/metrics.ts
```

**Step 3: Update imports**

```bash
grep -r "from \"@/lib/queries/dashboard" src/ --include="*.ts" --include="*.tsx"
```

Update:
- `from "@/lib/queries/dashboard"` → `from "@/features/admin-dashboard/api/queries"`
- `from "@/lib/queries/dashboard-metrics"` → `from "@/features/admin-dashboard/api/metrics"`

**Step 4: Verify**

```bash
pnpm typecheck
```

**Step 5: Commit**

```bash
git add src/features/admin-dashboard/
git commit -m "feat: create admin-dashboard feature with api structure"
```

---

### Task 6: Create b2b-request Feature

**Files:**
- Create: `src/features/b2b-request/api/actions.ts`
- Create: `src/features/b2b-request/schema.ts`
- Move from: `src/lib/actions/b2b.ts`
- Move from: `src/validation/contact.ts` (b2bRequestSchema only)

**Step 1: Create directory structure**

```bash
mkdir -p src/features/b2b-request/api
```

**Step 2: Create schema file**

Create `src/features/b2b-request/schema.ts`:

```typescript
import z from "zod";

const BUSINESS_TYPE_OPTIONS = [
  "restaurant",
  "hotel",
  "cafe",
  "shop",
  "other",
] as const;

export const b2bRequestSchema = z.object({
  companyName: z.string().trim().min(1, "Názov spoločnosti je povinný"),
  businessType: z
    .string()
    .refine(
      (val) =>
        BUSINESS_TYPE_OPTIONS.includes(
          val as (typeof BUSINESS_TYPE_OPTIONS)[number]
        ),
      { message: "Vyberte platný typ podniku" }
    ),
  userName: z.string().trim().min(1, "Meno a priezvisko je povinné"),
  email: z.string().trim().email("Neplatná emailová adresa"),
  phone: z.string().trim().min(1, "Telefónne číslo je povinné"),
});

export type B2BRequestSchema = z.infer<typeof b2bRequestSchema>;
```

**Step 3: Create actions file**

Create `src/features/b2b-request/api/actions.ts`:

```typescript
"use server";

import { sendEmail } from "@/lib/email";
import { b2bRequestSchema } from "../schema";

type SubmitB2BRequestResult =
  | { success: true }
  | { success: false; error: string };

export async function submitB2BRequest(data: {
  companyName: string;
  businessType: string;
  userName: string;
  email: string;
  phone: string;
}): Promise<SubmitB2BRequestResult> {
  try {
    // Validate input with zod
    const validationResult = b2bRequestSchema.safeParse(data);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { success: false, error: firstError?.message ?? "Neplatné údaje" };
    }

    const validatedData = validationResult.data;

    // Send email to staff
    await sendEmail.b2bRequest({
      companyName: validatedData.companyName,
      businessType: validatedData.businessType,
      userName: validatedData.userName,
      email: validatedData.email,
      phone: validatedData.phone,
    });

    return { success: true };
  } catch (_error) {
    return {
      success: false,
      error: "Nastala chyba pri odosielaní žiadosti. Skúste to prosím znova.",
    };
  }
}
```

**Step 4: Update imports**

```bash
grep -r "from \"@/lib/actions/b2b\"" src/ --include="*.ts" --include="*.tsx"
```

Update:
- `from "@/lib/actions/b2b"` → `from "@/features/b2b-request/api/actions"`

**Step 5: Verify**

```bash
pnpm typecheck
```

**Step 6: Commit**

```bash
git add src/features/b2b-request/
git commit -m "feat: create b2b-request feature with api structure"
```

---

## Phase 2: Restructure Existing Features

### Task 7: Restructure products Feature

**Files:**
- Modify: `src/features/products/`
- Create: `src/features/products/api/`
- Move: `actions.ts` → `api/actions.ts`
- Move: `queries.ts` → `api/queries.ts`

**Step 1: Create api directory**

```bash
mkdir -p src/features/products/api
```

**Step 2: Move files**

```bash
mv src/features/products/actions.ts src/features/products/api/actions.ts
mv src/features/products/queries.ts src/features/products/api/queries.ts
```

**Step 3: Update imports in consuming files**

```bash
grep -r "from \"@/features/products/actions\"" src/ --include="*.ts" --include="*.tsx"
grep -r "from \"@/features/products/queries\"" src/ --include="*.ts" --include="*.tsx"
```

Update:
- `from "@/features/products/actions"` → `from "@/features/products/api/actions"`
- `from "@/features/products/queries"` → `from "@/features/products/api/queries"`

**Step 4: Update internal imports**

Check `src/features/products/api/actions.ts` for import of schema:

```typescript
// Should be:
import type { UpdateProductSchema } from "@/features/products/schema";
```

**Step 5: Verify**

```bash
pnpm typecheck
```

**Step 6: Commit**

```bash
git add src/features/products/
git commit -m "refactor(products): move actions and queries to api folder"
```

---

### Task 8: Restructure categories Feature

**Files:**
- Modify: `src/features/categories/`
- Create: `src/features/categories/api/`
- Move: `actions.ts` → `api/actions.ts`
- Move: `queries.ts` → `api/queries.ts`
- Move: `src/lib/categories/types.ts` → `src/features/categories/types.ts`
- Merge: `src/lib/categories/validation.ts` → `src/features/categories/schema.ts`

**Step 1: Create api directory**

```bash
mkdir -p src/features/categories/api
```

**Step 2: Move existing files**

```bash
mv src/features/categories/actions.ts src/features/categories/api/actions.ts
mv src/features/categories/queries.ts src/features/categories/api/queries.ts
```

**Step 3: Move lib files**

```bash
mv src/lib/categories/types.ts src/features/categories/types.ts
```

**Step 4: Merge validation into schema**

Append content from `src/lib/categories/validation.ts` to `src/features/categories/schema.ts`

**Step 5: Update imports**

```bash
grep -r "from \"@/features/categories/actions\"" src/ --include="*.ts" --include="*.tsx"
grep -r "from \"@/features/categories/queries\"" src/ --include="*.ts" --include="*.tsx"
grep -r "from \"@/lib/categories" src/ --include="*.ts" --include="*.tsx"
```

Update accordingly.

**Step 6: Verify**

```bash
pnpm typecheck
```

**Step 7: Commit**

```bash
git add src/features/categories/ src/lib/categories/
git commit -m "refactor(categories): consolidate into single feature with api structure"
```

---

### Task 9: Restructure cart Feature

**Files:**
- Modify: `src/features/cart/`
- Create: `src/features/cart/api/`
- Move: `actions.ts` → `api/actions.ts`
- Move: `queries.ts` → `api/queries.ts`
- Keep: `cookies.ts` (stays at root of feature)

**Step 1: Create api directory**

```bash
mkdir -p src/features/cart/api
```

**Step 2: Move files**

```bash
mv src/features/cart/actions.ts src/features/cart/api/actions.ts
mv src/features/cart/queries.ts src/features/cart/api/queries.ts
```

**Step 3: Update imports**

```bash
grep -r "from \"@/features/cart/actions\"" src/ --include="*.ts" --include="*.tsx"
grep -r "from \"@/features/cart/queries\"" src/ --include="*.ts" --include="*.tsx"
```

Update to use `/api/` path.

**Step 4: Verify**

```bash
pnpm typecheck
```

**Step 5: Commit**

```bash
git add src/features/cart/
git commit -m "refactor(cart): move actions and queries to api folder"
```

---

### Task 10: Restructure checkout Feature

**Files:**
- Modify: `src/features/checkout/`
- Create: `src/features/checkout/api/`
- Move: `actions.ts` → `api/actions.ts`
- Move: `queries.ts` → `api/queries.ts`

**Step 1: Create api directory**

```bash
mkdir -p src/features/checkout/api
```

**Step 2: Move files**

```bash
mv src/features/checkout/actions.ts src/features/checkout/api/actions.ts
mv src/features/checkout/queries.ts src/features/checkout/api/queries.ts
```

**Step 3: Update imports**

```bash
grep -r "from \"@/features/checkout/actions\"" src/ --include="*.ts" --include="*.tsx"
grep -r "from \"@/features/checkout/queries\"" src/ --include="*.ts" --include="*.tsx"
```

**Step 4: Verify**

```bash
pnpm typecheck
```

**Step 5: Commit**

```bash
git add src/features/checkout/
git commit -m "refactor(checkout): move actions and queries to api folder"
```

---

### Task 11: Restructure orders Feature

**Files:**
- Modify: `src/features/orders/`
- Create: `src/features/orders/api/`
- Move: `actions.ts` → `api/actions.ts`
- Move: `queries.ts` → `api/queries.ts`

**Step 1: Create api directory**

```bash
mkdir -p src/features/orders/api
```

**Step 2: Move files**

```bash
mv src/features/orders/actions.ts src/features/orders/api/actions.ts
mv src/features/orders/queries.ts src/features/orders/api/queries.ts
```

**Step 3: Update imports**

```bash
grep -r "from \"@/features/orders/actions\"" src/ --include="*.ts" --include="*.tsx"
grep -r "from \"@/features/orders/queries\"" src/ --include="*.ts" --include="*.tsx"
```

**Step 4: Verify**

```bash
pnpm typecheck
```

**Step 5: Commit**

```bash
git add src/features/orders/
git commit -m "refactor(orders): move actions and queries to api folder"
```

---

### Task 12: Restructure stores Feature

**Files:**
- Modify: `src/features/stores/`
- Create: `src/features/stores/api/`
- Move: `actions.ts` → `api/actions.ts`
- Move: `queries.ts` → `api/queries.ts`
- Move: `src/lib/stores/types.ts` → `src/features/stores/types.ts`
- Merge: `src/lib/stores/validation.ts` → `src/features/stores/schema.ts`

**Step 1: Create api directory**

```bash
mkdir -p src/features/stores/api
```

**Step 2: Move existing files**

```bash
mv src/features/stores/actions.ts src/features/stores/api/actions.ts
mv src/features/stores/queries.ts src/features/stores/api/queries.ts
```

**Step 3: Move lib files**

```bash
mv src/lib/stores/types.ts src/features/stores/types.ts
```

**Step 4: Merge validation into schema**

Append content from `src/lib/stores/validation.ts` to `src/features/stores/schema.ts`

**Step 5: Update imports**

```bash
grep -r "from \"@/features/stores" src/ --include="*.ts" --include="*.tsx"
grep -r "from \"@/lib/stores" src/ --include="*.ts" --include="*.tsx"
```

**Step 6: Verify**

```bash
pnpm typecheck
```

**Step 7: Commit**

```bash
git add src/features/stores/ src/lib/stores/
git commit -m "refactor(stores): consolidate into single feature with api structure"
```

---

### Task 13: Restructure favorites Feature

**Files:**
- Modify: `src/features/favorites/`
- Create: `src/features/favorites/api/`
- Move: `actions.ts` → `api/actions.ts`
- Move: `queries.ts` → `api/queries.ts`

**Step 1: Create api directory**

```bash
mkdir -p src/features/favorites/api
```

**Step 2: Move files**

```bash
mv src/features/favorites/actions.ts src/features/favorites/api/actions.ts
mv src/features/favorites/queries.ts src/features/favorites/api/queries.ts
```

**Step 3: Update imports**

```bash
grep -r "from \"@/features/favorites/actions\"" src/ --include="*.ts" --include="*.tsx"
grep -r "from \"@/features/favorites/queries\"" src/ --include="*.ts" --include="*.tsx"
```

**Step 4: Verify**

```bash
pnpm typecheck
```

**Step 5: Commit**

```bash
git add src/features/favorites/
git commit -m "refactor(favorites): move actions and queries to api folder"
```

---

### Task 14: Restructure b2b Subfeatures

**Files:**
- Modify: `src/features/b2b/applications/`
- Modify: `src/features/b2b/clients/`
- Modify: `src/features/b2b/invoices/`
- Modify: `src/features/b2b/price-tiers/`

**Step 1: Check current structure**

```bash
ls -la src/features/b2b/applications/
ls -la src/features/b2b/clients/
ls -la src/features/b2b/invoices/
ls -la src/features/b2b/price-tiers/
```

**Step 2: For each subfeature with actions.ts or queries.ts**

If they already have these files at the root level, create api/ and move them:

```bash
# For applications
mkdir -p src/features/b2b/applications/api
mv src/features/b2b/applications/actions.ts src/features/b2b/applications/api/actions.ts 2>/dev/null || true
mv src/features/b2b/applications/queries.ts src/features/b2b/applications/api/queries.ts 2>/dev/null || true

# For clients
mkdir -p src/features/b2b/clients/api
mv src/features/b2b/clients/actions.ts src/features/b2b/clients/api/actions.ts 2>/dev/null || true
mv src/features/b2b/clients/queries.ts src/features/b2b/clients/api/queries.ts 2>/dev/null || true

# For invoices
mkdir -p src/features/b2b/invoices/api
mv src/features/b2b/invoices/actions.ts src/features/b2b/invoices/api/actions.ts 2>/dev/null || true
mv src/features/b2b/invoices/queries.ts src/features/b2b/invoices/api/queries.ts 2>/dev/null || true

# For price-tiers
mkdir -p src/features/b2b/price-tiers/api
mv src/features/b2b/price-tiers/actions.ts src/features/b2b/price-tiers/api/actions.ts 2>/dev/null || true
mv src/features/b2b/price-tiers/queries.ts src/features/b2b/price-tiers/api/queries.ts 2>/dev/null || true
```

**Step 3: Update imports**

```bash
grep -r "from \"@/features/b2b/" src/ --include="*.ts" --include="*.tsx" | grep -E "(actions|queries)"
```

Update paths to include `/api/`.

**Step 4: Verify**

```bash
pnpm typecheck
```

**Step 5: Commit**

```bash
git add src/features/b2b/
git commit -m "refactor(b2b): move actions and queries to api folders in subfeatures"
```

---

### Task 15: Move b2b-invoices Actions from lib

**Files:**
- Move: `src/lib/actions/invoices.ts` → `src/features/b2b/invoices/api/actions.ts`

**Step 1: Check if file exists**

```bash
ls -la src/features/b2b/invoices/api/actions.ts
```

**Step 2: If it exists, merge; if not, copy**

```bash
# If exists, manually merge the content
# If not exists:
mkdir -p src/features/b2b/invoices/api
cp src/lib/actions/invoices.ts src/features/b2b/invoices/api/actions.ts
```

**Step 3: Update imports**

```bash
grep -r "from \"@/lib/actions/invoices\"" src/ --include="*.ts" --include="*.tsx"
```

Update to: `from "@/features/b2b/invoices/api/actions"`

**Step 4: Verify**

```bash
pnpm typecheck
```

**Step 5: Commit**

```bash
git add src/features/b2b/invoices/
git commit -m "refactor(b2b-invoices): move invoice actions from lib to feature"
```

---

### Task 16: Create site-config Feature

**Files:**
- Create: `src/features/site-config/`
- Move: `src/lib/site-config/*` → `src/features/site-config/api/`

**Step 1: Create directory**

```bash
mkdir -p src/features/site-config/api
```

**Step 2: Move files**

```bash
mv src/lib/site-config/queries.ts src/features/site-config/api/queries.ts
mv src/lib/site-config/actions.ts src/features/site-config/api/actions.ts
```

**Step 3: Update imports**

```bash
grep -r "from \"@/lib/site-config" src/ --include="*.ts" --include="*.tsx"
```

Update to: `from "@/features/site-config/api/..."`

**Step 4: Verify**

```bash
pnpm typecheck
```

**Step 5: Commit**

```bash
git add src/features/site-config/ src/lib/site-config/
git commit -m "feat: create site-config feature with api structure"
```

---

## Phase 3: Clean Up

### Task 17: Update validation/contact.ts

**Files:**
- Modify: `src/validation/contact.ts`

**Step 1: Check current imports**

```bash
grep -r "from \"@/validation/contact\"" src/ --include="*.ts" --include="*.tsx"
```

**Step 2: If still used, keep only what's needed**

Since supportRequestSchema and b2bRequestSchema are moved, either:
- Remove the file if nothing else uses it
- Or keep only remaining schemas

**Step 3: Update any remaining imports**

Update to point to new locations:
- `supportRequestSchema` → `@/features/contact-form/schema`
- `b2bRequestSchema` → `@/features/b2b-request/schema`

**Step 4: Verify**

```bash
pnpm typecheck
```

**Step 5: Commit**

```bash
git add src/validation/contact.ts
git commit -m "refactor: update contact validation after feature migration"
```

---

### Task 18: Remove Old lib Files

**Files:**
- Delete: `src/lib/queries/`
- Delete: `src/lib/actions/`
- Delete: `src/lib/categories/`
- Delete: `src/lib/stores/`
- Delete: `src/lib/site-config/`

**Step 1: Verify no remaining imports**

```bash
grep -r "from \"@/lib/queries" src/ --include="*.ts" --include="*.tsx"
grep -r "from \"@/lib/actions" src/ --include="*.ts" --include="*.tsx"
grep -r "from \"@/lib/categories" src/ --include="*.ts" --include="*.tsx"
grep -r "from \"@/lib/stores" src/ --include="*.ts" --include="*.tsx"
grep -r "from \"@/lib/site-config" src/ --include="*.ts" --include="*.tsx"
```

Expected: No results

**Step 2: Remove directories**

```bash
rm -rf src/lib/queries
rm -rf src/lib/actions
rm -rf src/lib/categories
rm -rf src/lib/stores
rm -rf src/lib/site-config
```

**Step 3: Verify**

```bash
pnpm typecheck
pnpm lint
```

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove old lib/queries and lib/actions directories"
```

---

### Task 19: Final Verification

**Step 1: Run full typecheck**

```bash
pnpm typecheck
```

Expected: No errors

**Step 2: Run linter**

```bash
pnpm lint
```

Expected: No critical errors

**Step 3: Try development build**

```bash
pnpm dev
```

Expected: Server starts without errors

**Step 4: Test a few routes**

Manually test:
- Homepage
- Product page
- Contact form
- Admin dashboard

**Step 5: Final commit if needed**

```bash
git add -A
git commit -m "chore: final cleanup after feature restructure"
```

---

### Task 20: Update CLAUDE.md Documentation

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update Feature Modules section**

Update the documentation to reflect the new structure:

```markdown
### Feature Modules (`src/features/`)
Domain-specific business logic organized by feature:
- `cart/` - Cookie-based cart with server actions
- `checkout/` - Order creation, pickup date logic ([docs](docs/features/checkout.md))
- `products/`, `categories/`, `stores/`, `orders/`, `favorites/`
- `contact-form/` - Contact form submission
- `user-profile/` - User profile management
- `user-management/` - Admin user management
- `admin-dashboard/` - Admin dashboard metrics and widgets
- `media-library/` - Media upload and management
- `site-config/` - Site configuration
- `b2b-request/` - B2B application requests
- `b2b/` - B2B features (applications, clients, invoices, price-tiers)

Each feature contains:
- `api/` - Server-side code (actions.ts, queries.ts)
- `components/` - Feature-specific components
- `schema.ts` - Zod validation schemas
- `types.ts` - TypeScript types
- `hooks.ts` - Custom React hooks (for complex features, optional)
```

**Step 2: Update Shared Code section**

Remove references to lib/queries and lib/actions:

```markdown
### Shared Code
- `src/lib/auth/` - Better-auth setup, guards, client, session utilities
- `src/lib/email/` - Email templates and sending
- `src/lib/` - Utilities (formatting, validation, constants, etc.)
- `src/components/` - Shared UI components
- `src/db/` - Drizzle schema, types, migrations
- `src/validation/` - Shared Zod schemas
- `src/store/` - Zustand stores
```

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md to reflect new feature structure"
```

---

## Summary

After completing all tasks:

1. ✅ All business logic moved from `lib/` to `features/`
2. ✅ Each feature has clear `api/` folder for server-side code
3. ✅ Granular features created (contact-form, user-profile, etc.)
4. ✅ All existing features restructured with api/ folders
5. ✅ Old lib/queries and lib/actions removed
6. ✅ Documentation updated

**Result:** Clean feature-based organization with clear server/client separation, making the codebase easier to navigate and maintain.
