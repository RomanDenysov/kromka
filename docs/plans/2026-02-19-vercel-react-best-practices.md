# Vercel React Best Practices Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply Vercel React best practices across the codebase to eliminate correctness bugs, reduce JS bundle by ~280KB, fix hydration mismatches, and eliminate waterfall fetches — all without breaking existing functionality.

**Architecture:** Fixes are grouped by category and ordered by impact. No architectural changes — each fix is surgical (one file at a time). The project uses Next.js 16 App Router with React Compiler, so memoization is often not needed — focus is on correctness bugs, bundle size (dynamic imports), and async patterns.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Drizzle ORM, Neon HTTP driver, next/dynamic, React.cache(), next/server after()

**Branch:** `perf/vercel-react-best-practices`

**Verification commands (no test suite — use these):**
```bash
pnpm typecheck   # Must pass after every task
pnpm lint        # Must pass after every task
pnpm build       # Must pass at end of each phase
```

---

## Phase 1 — Correctness Bugs (Fix First — These Break Behavior)

### Task 1: Fix stale closure in `use-like.ts`

**Rule:** `rerender-functional-setstate`
**Problem:** `toggleLike()` reads `liked` from closure — if state updates haven't flushed, toggle can use a stale value.

**Files:**
- Modify: `src/hooks/use-like.ts:39`

**Step 1: Read the file**
```bash
# Read src/hooks/use-like.ts to understand current toggle implementation
```

**Step 2: Find the toggle handler — it looks like this:**
```typescript
// WRONG — reads `liked` from stale closure
const toggleLike = async () => {
  setLiked(!liked);
  // ...
};
```

**Step 3: Replace with functional setState**
```typescript
// CORRECT — always operates on latest state
const toggleLike = async () => {
  setLiked((prev) => !prev);
  // ...
};
```

**Step 4: Verify**
```bash
pnpm typecheck
```
Expected: no errors

**Step 5: Commit**
```bash
git add src/hooks/use-like.ts
git commit -m "fix(hooks): use functional setState in use-like to prevent stale closure"
```

---

### Task 2: Fix stale closure in `use-favorite.ts`

**Rule:** `rerender-functional-setstate`
**Problem:** Same stale closure pattern in the favorite toggle at line 63.

**Files:**
- Modify: `src/hooks/use-favorite.ts:63`

**Step 1: Read the file**
```bash
# Read src/hooks/use-favorite.ts
```

**Step 2: Find the toggle at line 63 and replace with functional setState**
```typescript
// WRONG
setFavorite(!favorite);

// CORRECT
setFavorite((prev) => !prev);
```

**Step 3: Verify**
```bash
pnpm typecheck
```

**Step 4: Commit**
```bash
git add src/hooks/use-favorite.ts
git commit -m "fix(hooks): use functional setState in use-favorite to prevent stale closure"
```

---

### Task 3: Fix `useIsMobile` hydration mismatch

**Rule:** `rendering-hydration-no-flicker`
**Problem:** `useIsMobile()` returns `!!undefined = false` on first render, then updates after `useEffect` — causes layout shift on mobile. Used in `checkout-list.tsx`.

**Files:**
- Modify: `src/hooks/use-mobile.ts`

**Step 1: Read the file**
```bash
# Read src/hooks/use-mobile.ts
```

**Step 2: Understand the current pattern**
```typescript
// CURRENT — causes hydration mismatch
const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);
// useEffect sets it after hydration
return !!isMobile; // false on server, true/false on client → MISMATCH
```

**Step 3: Replace with `useSyncExternalStore` for SSR-safe hydration**
```typescript
import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
}

function getServerSnapshot() {
  return false; // SSR default — consistent with no-JS mobile detection
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

**Step 4: Verify no TypeScript errors**
```bash
pnpm typecheck
```

**Step 5: Commit**
```bash
git add src/hooks/use-mobile.ts
git commit -m "fix(hooks): replace useIsMobile with useSyncExternalStore to fix hydration mismatch"
```

---

### Task 4: Fix `use-favorite.ts` initialization flicker

**Rule:** `rendering-hydration-no-flicker`
**Problem:** `useFavorite` initializes with `favorite: null` and `isLoading: true` even when `initialValue` is already provided as a prop — causes visible flicker on every product card.

**Files:**
- Modify: `src/hooks/use-favorite.ts:20-27`

**Step 1: Read lines 20-27 of `src/hooks/use-favorite.ts`**

**Step 2: Change initialization to use `initialValue` immediately**
```typescript
// WRONG — ignores initialValue on first render
const [favorite, setFavorite] = useState<boolean | null>(null);
const [isLoading, setIsLoading] = useState(true);

// CORRECT — use initialValue as starting state to avoid flicker
const [favorite, setFavorite] = useState<boolean | null>(initialValue ?? null);
const [isLoading, setIsLoading] = useState(false);
```

**Note:** Verify what the `useEffect` does with these values — don't break the sync logic that keeps state in sync with session/server.

**Step 3: Verify**
```bash
pnpm typecheck
```

**Step 4: Commit**
```bash
git add src/hooks/use-favorite.ts
git commit -m "fix(hooks): initialize useFavorite with initialValue to prevent flicker"
```

---

## Phase 2 — Bundle Size (Biggest User-Facing Impact)

### Task 5: Dynamic import `maplibre-gl` (~85KB saved)

**Rule:** `bundle-dynamic-imports`
**Problem:** `src/components/ui/map.tsx` imports `maplibre-gl` statically — loaded for ALL users visiting `/predajne` (stores page) even if they never scroll to the map.

**Files:**
- Modify: `src/components/stores-map.tsx`

**Step 1: Read `src/components/stores-map.tsx` and `src/components/ui/map.tsx`**

**Step 2: In `stores-map.tsx`, replace the static import of Map with `next/dynamic`**
```typescript
import dynamic from "next/dynamic";

// Replace static: import { Map } from "@/components/ui/map";
const Map = dynamic(() => import("@/components/ui/map").then((m) => m.Map), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full animate-pulse rounded-lg bg-muted" />
  ),
});
```

**Step 3: Verify the map still renders (check for TypeScript errors)**
```bash
pnpm typecheck
```

**Step 4: Commit**
```bash
git add src/components/stores-map.tsx
git commit -m "perf(bundle): lazy-load maplibre-gl with next/dynamic (~85KB savings)"
```

---

### Task 6: Dynamic import `@react-google-maps/api` (~90KB saved)

**Rule:** `bundle-dynamic-imports`
**Problem:** `src/components/forms/fields/address-autocomplete-field.tsx` imports `@react-google-maps/api` statically. Used in B2B form and store admin form — mostly admin/B2B users but still heavy.

**Files:**
- Modify: `src/components/forms/b2b-application-form.tsx` (or wherever `AddressAutocompleteField` is imported)
- Modify: `src/app/(admin)/admin/stores/[id]/_components/store-form.tsx`

**Step 1: Read `src/components/forms/fields/address-autocomplete-field.tsx` to understand the export**

**Step 2: Read the two consumer files to find the import location**

**Step 3: In each consumer file, replace static import with `next/dynamic`**
```typescript
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const AddressAutocompleteField = dynamic(
  () =>
    import("@/components/forms/fields/address-autocomplete-field").then(
      (m) => m.AddressAutocompleteField
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-9 w-full" />,
  }
);
```

**Step 4: Verify**
```bash
pnpm typecheck
```

**Step 5: Commit**
```bash
git add src/components/forms/b2b-application-form.tsx src/app/(admin)/admin/stores/[id]/_components/store-form.tsx
git commit -m "perf(bundle): lazy-load @react-google-maps with next/dynamic (~90KB savings)"
```

---

### Task 7: Dynamic import `recharts` (~45KB saved)

**Rule:** `bundle-dynamic-imports`
**Problem:** `src/app/(admin)/admin/_components/revenue-chart.tsx` statically imports recharts. Admin-only but still adds to the initial bundle.

**Files:**
- Modify: `src/app/(admin)/admin/_components/revenue-chart-section.tsx`
- Modify: `src/app/(admin)/admin/_components/growth-comparison-card.tsx`

**Step 1: Read the chart section and comparison card files to find where chart components are imported**

**Step 2: Apply dynamic import at the consumer level**
```typescript
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const RevenueChart = dynamic(
  () =>
    import("@/app/(admin)/admin/_components/revenue-chart").then(
      (m) => m.RevenueChart
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-96 w-full" />,
  }
);
```

**Note:** If the chart is also exported from `growth-comparison-card`, apply the same pattern there.

**Step 3: Verify**
```bash
pnpm typecheck
```

**Step 4: Commit**
```bash
git add src/app/(admin)/admin/_components/revenue-chart-section.tsx src/app/(admin)/admin/_components/growth-comparison-card.tsx
git commit -m "perf(bundle): lazy-load recharts with next/dynamic (~45KB savings)"
```

---

### Task 8: Dynamic import `@tiptap` editor (~60KB saved)

**Rule:** `bundle-dynamic-imports` + `bundle-conditional`
**Problem:** `src/widgets/editor/editor.tsx` imports tiptap statically. Used in admin blog/product forms — loads even when user hasn't opened a form.

**Files:**
- Modify: `src/components/forms/fields/rich-text-field.tsx`

**Step 1: Read `src/components/forms/fields/rich-text-field.tsx`**

**Step 2: Replace the static editor import with `next/dynamic`**
```typescript
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const Editor = dynamic(
  () => import("@/widgets/editor/editor").then((m) => m.Editor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-32 w-full" />,
  }
);
```

**Note:** Tiptap requires browser APIs so `ssr: false` is mandatory.

**Step 3: Verify**
```bash
pnpm typecheck
```

**Step 4: Commit**
```bash
git add src/components/forms/fields/rich-text-field.tsx
git commit -m "perf(bundle): lazy-load tiptap editor with next/dynamic (~60KB savings)"
```

---

## Phase 3 — Server Performance (React.cache + after())

### Task 9: Wrap `getFavoriteIds` with `React.cache()`

**Rule:** `server-cache-react`
**Problem:** `getFavoriteIds()` is called from multiple RSC components (ProductsGrid, ProductRecommendations) in one request — hits the database each time without per-request deduplication.

**Files:**
- Modify: `src/features/favorites/api/queries.ts:10-24`

**Step 1: Read `src/features/favorites/api/queries.ts`**

**Step 2: Add `React.cache()` wrapper**
```typescript
import { cache } from "react";

// BEFORE:
export async function getFavoriteIds(): Promise<string[]> { ... }

// AFTER:
export const getFavoriteIds = cache(async (): Promise<string[]> => {
  // ... existing code unchanged
});
```

**Step 3: Verify exports still work**
```bash
pnpm typecheck
```

**Step 4: Commit**
```bash
git add src/features/favorites/api/queries.ts
git commit -m "perf(server): wrap getFavoriteIds with React.cache() for per-request deduplication"
```

---

### Task 10: Wrap `getSiteConfig` with `React.cache()`

**Rule:** `server-cache-react`
**Problem:** `getSiteConfig()` uses `"use cache"` (cross-request) but not `React.cache()` (per-request deduplication). If called with the same key multiple times in a request, hits DB multiple times.

**Files:**
- Modify: `src/features/site-config/api/queries.ts:14-24`

**Step 1: Read `src/features/site-config/api/queries.ts`**

**Step 2: Wrap with `React.cache()`**
```typescript
import { cache } from "react";

export const getSiteConfig = cache(async (key: SiteConfigKey) => {
  "use cache";
  cacheLife("max");
  cacheTag(`site-setting-${key}`);
  // ... existing query unchanged
});
```

**Step 3: Verify**
```bash
pnpm typecheck
```

**Step 4: Commit**
```bash
git add src/features/site-config/api/queries.ts
git commit -m "perf(server): wrap getSiteConfig with React.cache() for per-request deduplication"
```

---

### Task 11: Use `after()` for order notifications

**Rule:** `server-after-nonblocking`
**Problem:** B2C and B2B order actions fire notifications with floating promises (`.catch()` handlers). While non-blocking, `after()` from Next.js is the idiomatic API for fire-and-forget after response.

**Files:**
- Modify: `src/features/orders/actions/create-b2c-order.ts:103-146`
- Modify: `src/features/orders/actions/create-b2b-order.ts:103-120`

**Step 1: Read both order action files to see the current notification pattern**

**Step 2: Import `after` and wrap fire-and-forget calls**
```typescript
import { after } from "next/server";

// BEFORE (floating promises):
notifyOrderCreated(orderId).catch((err) => {
  log.email.error({ err, orderId }, "Failed to send order notification");
});
captureServerEvent(userId, "order completed", { ... }).catch((err) => {
  log.orders.error({ err, orderId }, "Failed to capture PostHog event");
});

// AFTER (idiomatic Next.js):
after(async () => {
  await notifyOrderCreated(orderId).catch((err) => {
    log.email.error({ err, orderId }, "Failed to send order notification");
  });
  await captureServerEvent(userId, "order completed", { ... }).catch((err) => {
    log.orders.error({ err, orderId }, "Failed to capture PostHog event");
  });
});
```

**Note:** `after()` is available in Next.js 15+. Verify it's exported from `next/server` in this project's Next.js version first. If not available, skip this task.

**Step 3: Verify**
```bash
pnpm typecheck
```

**Step 4: Commit**
```bash
git add src/features/orders/actions/create-b2c-order.ts src/features/orders/actions/create-b2b-order.ts
git commit -m "perf(server): use after() for non-blocking order notifications"
```

---

## Phase 4 — Async Waterfall Elimination

### Task 12: Parallelize blog post tag query

**Rule:** `async-parallel`
**Problem:** `src/features/posts/api/queries.ts:92-107` — sequential awaits for tag lookup then post count. Two independent DB queries that can run in parallel.

**Files:**
- Modify: `src/features/posts/api/queries.ts:92-107`

**Step 1: Read `src/features/posts/api/queries.ts` around lines 92-107**

**Step 2: Identify the sequential pattern**
```typescript
// BEFORE — sequential (waterfall):
const tag = await db.query.tags.findFirst(...);
const count = await db.select().from(posts)...;
```

**Step 3: Wrap in Promise.all**
```typescript
// AFTER — parallel:
const [tag, [{ count }]] = await Promise.all([
  db.query.tags.findFirst(...),
  db.select(...).from(posts)...,
]);
```

**Step 4: Verify**
```bash
pnpm typecheck
```

**Step 5: Commit**
```bash
git add src/features/posts/api/queries.ts
git commit -m "perf(db): parallelize blog post tag lookup and count query"
```

---

### Task 13: Parallelize admin post list query

**Rule:** `async-parallel`
**Problem:** `src/features/posts/api/queries.ts:337-358` — admin post list counts posts sequentially before fetching them.

**Files:**
- Modify: `src/features/posts/api/queries.ts:337-358`

**Step 1: Read lines 337-358 of `src/features/posts/api/queries.ts`**

**Step 2: Identify the sequential count + fetch pattern and wrap in `Promise.all`**
```typescript
// AFTER:
const [posts, [{ count }]] = await Promise.all([
  db.query.posts.findMany(...),
  db.select({ count: count() }).from(postsTable)...,
]);
```

**Step 3: Verify**
```bash
pnpm typecheck
```

**Step 4: Commit**
```bash
git add src/features/posts/api/queries.ts
git commit -m "perf(db): parallelize admin post list count and data fetch"
```

---

### Task 14: Parallelize order confirmation page fetches

**Rule:** `async-parallel`
**Problem:** `src/app/(public)/pokladna/[orderId]/page.tsx:20-39` — fetches order then session sequentially. Independent fetches that can be parallelized.

**Files:**
- Modify: `src/app/(public)/pokladna/[orderId]/page.tsx:20-39`

**Step 1: Read the file around lines 20-39**

**Step 2: Replace sequential awaits with Promise.all**
```typescript
// BEFORE:
const order = await getOrderById(orderId);
const session = await getSession();

// AFTER:
const [order, session] = await Promise.all([
  getOrderById(orderId),
  getSession(),
]);
```

**Step 3: Verify**
```bash
pnpm typecheck
```

**Step 4: Commit**
```bash
git add "src/app/(public)/pokladna/[orderId]/page.tsx"
git commit -m "perf(page): parallelize order and session fetch on confirmation page"
```

---

## Phase 5 — Re-render Stabilization (Medium Impact)

### Task 15: Stabilize inline objects in product card components

**Rule:** `rerender-memo-with-default-value`
**Problem:** Components in the product grid pass inline object/array literals as props — creates new references on every render, forcing re-renders of all 16+ product cards on the main shop page.

**Files:**
- Read and identify the specific files from: `src/features/products/components/`, `src/features/cart/components/`

**Step 1: Read `src/features/products/components/products-grid.tsx` and product card components**

**Step 2: Find inline objects passed as props, e.g.:**
```typescript
// WRONG — new object reference every render
<ProductCard options={{ showBadge: true, size: "md" }} />

// CORRECT — stable reference, hoist outside component or useMemo
const PRODUCT_CARD_OPTIONS = { showBadge: true, size: "md" } as const;
<ProductCard options={PRODUCT_CARD_OPTIONS} />
```

**Note:** With React Compiler enabled in this project, many of these may already be optimized automatically. Focus only on cases the rerender-investigator flagged with actual line numbers.

**Step 3: Read the rerender-investigator findings to get exact file paths and line numbers (check PROJECT_ANALYSIS.md if it was written there, or re-read the original analysis)**

**Step 4: Apply targeted fixes only to the specific lines identified**

**Step 5: Verify**
```bash
pnpm typecheck && pnpm lint
```

**Step 6: Commit**
```bash
git add <modified files>
git commit -m "perf(rerender): hoist stable object literals to prevent unnecessary re-renders"
```

---

### Task 16: Stabilize carousel options and plugins

**Rule:** `rerender-memo-with-default-value`
**Problem:** Carousel component recreates its `options` and `plugins` arrays/objects on every render.

**Files:**
- Identify the carousel component from the rerender-investigator report (likely in `src/features/products/components/` or `src/components/`)

**Step 1: Read the identified carousel component**

**Step 2: Hoist stable config outside the component function**
```typescript
// WRONG — recreated every render
function ProductCarousel() {
  const plugins = [Autoplay({ delay: 3000 })];
  // ...
}

// CORRECT — stable reference
const CAROUSEL_PLUGINS = [Autoplay({ delay: 3000 })];

function ProductCarousel() {
  // use CAROUSEL_PLUGINS
}
```

**Note:** If plugins need to be recreated due to dynamic config, use `useMemo` with stable deps.

**Step 3: Verify**
```bash
pnpm typecheck
```

**Step 4: Commit**
```bash
git add <carousel file>
git commit -m "perf(rerender): hoist carousel options outside component to prevent recreation"
```

---

### Task 17: Fix primitive dependencies in useEffect

**Rule:** `rerender-dependencies`
**Problem:** useEffect hooks using full objects (user, session, etc.) in deps array instead of primitive IDs — can cause infinite re-renders or missed updates.

**Files:**
- Identified by rerender-investigator (check exact file paths in the analysis)

**Step 1: Find the specific useEffect hooks with object deps**

**Step 2: Replace object references with primitive ids**
```typescript
// WRONG — object reference changes every render
useEffect(() => { ... }, [user]);

// CORRECT — primitive value, stable reference
useEffect(() => { ... }, [user?.id]);
```

**Step 3: Verify**
```bash
pnpm typecheck
```

**Step 4: Commit**
```bash
git add <modified files>
git commit -m "fix(hooks): use primitive deps in useEffect to prevent stale/infinite effects"
```

---

## Phase 6 — Rendering Patterns (Medium Impact)

### Task 18: Add `content-visibility` to product and blog grids

**Rule:** `rendering-content-visibility`
**Problem:** `products-grid.tsx` and `blog-grid.tsx` render all items even when off-screen. On pages with many items, this slows scrolling.

**Files:**
- Modify: `src/features/products/components/products-grid.tsx`
- Modify: `src/features/posts/components/blog-grid.tsx`

**Step 1: Read both grid files**

**Step 2: Add `content-visibility: auto` and `contain-intrinsic-size` to grid item wrappers**
```tsx
// In the grid item wrapper (li or div per card):
<div
  className="..."
  style={{ contentVisibility: "auto", containIntrinsicSize: "0 400px" }}
>
  <ProductCard ... />
</div>
```

Or with Tailwind CSS (if the project has a custom plugin):
```tsx
// Check if content-visibility is in Tailwind config first
// If not, use inline style
```

**Note:** `contain-intrinsic-size` should match the approximate height of a card — measure actual card height from the UI or CSS.

**Step 3: Verify no visual regressions (typecheck)**
```bash
pnpm typecheck
```

**Step 4: Commit**
```bash
git add src/features/products/components/products-grid.tsx src/features/posts/components/blog-grid.tsx
git commit -m "perf(rendering): add content-visibility:auto to product and blog grids"
```

---

### Task 19: Make async intent explicit in `e-shop/page.tsx`

**Rule:** `server-dedup-props` (code clarity)
**Problem:** `getCategories()` is called without `await` and the variable named `categories` — but it's actually a Promise. Misleading name causes confusion.

**Files:**
- Modify: `src/app/(public)/e-shop/page.tsx:49-51`

**Step 1: Read `src/app/(public)/e-shop/page.tsx` around line 49**

**Step 2: Rename the variable to make the Promise intent clear**
```typescript
// BEFORE — misleading name
const categories = getCategories();

// AFTER — explicit intent
const categoriesPromise = getCategories();
```

**Step 3: Update all usages of `categories` → `categoriesPromise` in this file**

**Step 4: Verify**
```bash
pnpm typecheck
```

**Step 5: Commit**
```bash
git add "src/app/(public)/e-shop/page.tsx"
git commit -m "refactor(page): rename categories to categoriesPromise to clarify async intent"
```

---

## Phase 7 — Final Verification

### Task 20: Full build verification

**Step 1: Run full typecheck**
```bash
pnpm typecheck
```
Expected: 0 errors

**Step 2: Run linter**
```bash
pnpm lint
```
Expected: 0 errors

**Step 3: Run production build**
```bash
pnpm build
```
Expected: Build succeeds. Check the output for bundle size improvements — look for chunks containing `maplibre`, `recharts`, `@tiptap` being moved to separate chunks (lazy-loaded).

**Step 4: Final commit if any cleanup needed**
```bash
git add -p  # Stage any remaining changes
git commit -m "chore: final cleanup after Vercel best practices implementation"
```

---

## Summary of Changes

| Phase | Changes | Impact |
|-------|---------|--------|
| 1 — Correctness | 4 bug fixes (stale closures, hydration mismatch, favorite flicker) | Correctness |
| 2 — Bundle Size | 4 dynamic imports (maplibre, Google Maps, recharts, tiptap) | ~280KB JS reduction |
| 3 — Server Perf | React.cache() × 2, after() for notifications | -10-30ms per request |
| 4 — Waterfalls | 3 × Promise.all() in blog queries and order page | -70-130ms per page |
| 5 — Re-renders | Stable object refs, functional setState, primitive deps | Fewer renders on shop page |
| 6 — Rendering | content-visibility on grids, code clarity | Scroll performance |

**Total estimated user-facing improvements:**
- JS bundle: ~280KB smaller (maplibre + Google Maps + recharts + tiptap deferred)
- Page load: ~70-130ms faster (eliminated DB waterfalls)
- Mobile hydration: No more layout shift on stores page
- Favorite buttons: No flicker on product cards

---

## Notes

- **React Compiler is enabled** in this project — it handles many memoization cases automatically. Don't add `useMemo`/`React.memo` where React Compiler already optimizes.
- **No `db.transaction()`** — Neon HTTP driver doesn't support it. All DB changes are sequential or `Promise.all`.
- **No barrel files** — Import directly from specific files per project rules.
- **Test each phase** with `pnpm typecheck` and `pnpm build` before moving to the next.
