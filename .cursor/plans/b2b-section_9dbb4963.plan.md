---
name: b2b-section
overview: Using the writing-plans skill to create the implementation plan. This plan covers the full B2B landing, application flow, admin management, pricing, and invoices without running DB migrations (per your request).
todos:
  - id: docs-b2b
    content: Write B2B docs + diagrams under docs/features/b2b
    status: completed
  - id: schema-b2b-apps
    content: Add b2b_applications table + types (no migrate)
    status: completed
  - id: public-b2b-pages
    content: Build /b2b landing + /b2b/apply flow + email
    status: completed
  - id: b2b-catalog-pricing
    content: Add /b2b/shop + pricing utilities + UI price updates
    status: completed
  - id: orders-b2b
    content: Wire B2B pricing + companyId into cart/checkout/orders
    status: completed
  - id: admin-b2b
    content: Create /admin/b2b pages + actions (apps, clients, tiers, invoices)
    status: completed
  - id: nav-testing
    content: Update navigation + run checks
    status: completed
---

# B2B Section Implementation Plan

## Scope + assumptions

- **No DB migrations will be executed**; we will only update schema/types and leave migration runs to you.
- **Access:** B2B catalog will live at `/b2b/shop` and be restricted to organization members.
- **Invites:** Approval should create an organization and send an invitation to the contact email. (Assumption: better-auth organization invitation API is available; if not, fallback to storing an invitation row and sending a manual email.)

## Phase 1 — Architecture docs

- Add B2B documentation under [`docs/features/b2b/`](docs/features/b2b/):
- `README.md` with system overview and key concepts.
- `architecture.md` with mermaid diagrams: Application → Organization → PriceTier → Prices → Products, plus user journey and admin workflows.
- `api-actions.md` listing server actions with input/output types.
- Link the new docs from [`docs/README.md`](docs/README.md).

## Phase 2 — Database schema + types (no migration run)

- Update [`src/db/schema.ts`](src/db/schema.ts):
- Add `b2b_applications` table with fields: `id`, `companyName`, `ico`, `dic`, `icDph`, `contactName`, `contactEmail`, `contactPhone`, `billingAddress`, `message`, `status`, `rejectionReason`, `createdAt`, `updatedAt`, `reviewedAt`, `reviewedBy`.
- Add indexes for `status`, `createdAt`, and `reviewedAt`.
- Add relations to `users` for `reviewedBy`.
- Update [`src/db/types.ts`](src/db/types.ts) with `B2bApplicationStatus = "pending" | "approved" | "rejected"`.

## Phase 3 — Public B2B landing + application flow

- Replace the current `/b2b` page with a new landing page in `[src/app/(public)/b2b/page.tsx](src/app/\\(public)/b2b/page.tsx)`:
- Hero, benefits grid, “How it works”, and CTA linking to `/b2b/apply`.
- Reuse layout utilities in [`src/components/landing`](src/components/landing) or add a `b2b` section folder there.
- Create `/b2b/apply` in `[src/app/(public)/b2b/apply/page.tsx](src/app/\\(public)/b2b/apply/page.tsx)`:
- Expand the form using a new schema in [`src/validation/b2b.ts`](src/validation/b2b.ts).
- Rework [`src/components/forms/b2b-form.tsx`](src/components/forms/b2b-form.tsx) into a full application form (company, contact, billing address, message).
- Add a success page (`/b2b/apply/success`) or inline success state (toast + panel) and ensure the submit action redirects/clears state.
- Update email template [`src/lib/email/templates/b2b-request.tsx`](src/lib/email/templates/b2b-request.tsx) to include all new fields.
- Implement `submitB2bApplication` server action (likely in [`src/features/b2b/actions.ts`](src/features/b2b/actions.ts)) to:
- Validate input, insert into `b2b_applications`, and send the staff notification email.

## Phase 4 — B2B catalog (separate route) + pricing utilities

- Add guarded `/b2b/shop` route in `[src/app/(public)/b2b/shop/page.tsx](src/app/\\(public)/b2b/shop/page.tsx)`:
- Use `getUserDetails()` to enforce organization membership; otherwise redirect/unauthorized.
- Reuse `ProductsGrid`/filters, but backed by a **B2B** product query.
- Create catalog-aware product/category queries:
- Extend [`src/features/products/queries.ts`](src/features/products/queries.ts) with `getProductsByCatalog({ catalog, priceTierId })` that filters by `showInB2b` vs `showInB2c` and optionally overlays tier prices.
- Add `getCategoriesByCatalog` in [`src/features/categories/queries.ts`](src/features/categories/queries.ts).
- Add pricing helpers in [`src/lib/pricing.ts`](src/lib/pricing.ts) (or `features/b2b/pricing.ts`) to compute effective price and badges.

## Phase 5 — Pricing display + cart/checkout calculations

- Update price display components to use effective price and a “B2B cena” badge when applicable:
- [`src/features/products/components/product-card.tsx`](src/features/products/components/product-card.tsx)
- `[src/app/(public)/product/[slug]/page.tsx](src/app/(public)/product/[slug]/page.tsx)`
- [`src/components/shared/product-cart-list-item.tsx`](src/components/shared/product-cart-list-item.tsx)
- [`src/features/cart/components/cart-drawer-item.tsx`](src/features/cart/components/cart-drawer-item.tsx)
- [`src/features/checkout/components/checkout-list-item.tsx`](src/features/checkout/components/checkout-list-item.tsx)
- Update cart data to apply tier pricing:
- Change [`src/features/cart/queries.ts`](src/features/cart/queries.ts) so `getDetailedCart` accepts `priceTierId` and returns tier-adjusted `priceCents`.
- Update call sites (cart drawer and checkout) to pass the B2B user’s tier from `getUserDetails()`.
- Update checkout:
- Show “Pay by invoice” option for B2B users in [`src/features/checkout/components/checkout-form.tsx`](src/features/checkout/components/checkout-form.tsx) and hide/disable for B2C.
- Add server-side guard in `createOrderFromCart` to prevent `invoice` payment method for non‑B2B users.

## Phase 6 — Order creation + B2B attribution

- Update [`src/features/orders/actions.ts`](src/features/orders/actions.ts):
- Derive `companyId` and `priceTierId` from `getUserDetails()`.
- Compute order item prices using tier prices (fallback to base price) and store in `orderItems`/`productSnapshot`.
- Set `orders.companyId` for B2B orders.
- Review “repeat order” flow in [`src/features/checkout/queries.ts`](src/features/checkout/queries.ts) so item prices reflect order item prices (not current product price) for B2B users.

## Phase 7 — Admin B2B section

- Create `/admin/b2b/*` routes:
- Applications list/detail: `[src/app/(admin)/admin/b2b/applications/page.tsx](src/app/\\(admin)/admin/b2b/applications/page.tsx)`, `[src/app/(admin)/admin/b2b/applications/[id]/page.tsx](src/app/(admin)/admin/b2b/applications/[id]/page.tsx)`.
- Clients list/detail: `[src/app/(admin)/admin/b2b/clients/page.tsx](src/app/\\(admin)/admin/b2b/clients/page.tsx)`, `[src/app/(admin)/admin/b2b/clients/[id]/page.tsx](src/app/(admin)/admin/b2b/clients/[id]/page.tsx)`.
- Price tiers list/detail: `[src/app/(admin)/admin/b2b/price-tiers/page.tsx](src/app/\\(admin)/admin/b2b/price-tiers/page.tsx)`, `[src/app/(admin)/admin/b2b/price-tiers/[id]/page.tsx](src/app/(admin)/admin/b2b/price-tiers/[id]/page.tsx)`.
- Invoices list/detail: `[src/app/(admin)/admin/b2b/invoices/page.tsx](src/app/\\(admin)/admin/b2b/invoices/page.tsx)`, `[src/app/(admin)/admin/b2b/invoices/[id]/page.tsx](src/app/(admin)/admin/b2b/invoices/[id]/page.tsx)`.
- Create B2B admin data layer under [`src/features/b2b/`](src/features/b2b/):
- `applications/queries.ts`, `applications/actions.ts`
- `clients/queries.ts`, `clients/actions.ts`
- `price-tiers/queries.ts`, `price-tiers/actions.ts`
- `invoices/queries.ts`, `invoices/actions.ts` (reuse [`src/lib/actions/invoices.ts`](src/lib/actions/invoices.ts) where possible)
- Build list/detail UIs with the existing data table system in [`src/widgets/data-table`](src/widgets/data-table) and patterns from [`src/components/tables/products`](src/components/tables/products).
- Add approve/reject UI with rejection reason; approval action should:
- Create organization with billing fields.
- Assign a price tier.
- Send invitation email to the contact email.
- Update `b2b_applications` status + review metadata.
- Add organization edit form for billing info and price tier assignment.
- Add price tier editor with bulk product price updates using `PriceInputField` from [`src/components/forms/fields/price-input-field.tsx`](src/components/forms/fields/price-input-field.tsx).

## Phase 8 — Navigation + integration

- Add a “B2B” admin group to [`src/widgets/admin-sidebar/app-sidebar.tsx`](src/widgets/admin-sidebar/app-sidebar.tsx) with links to Applications, Clients, Price Tiers, Invoices.
- Ensure public navigation includes `/b2b` and add a B2B shop CTA where appropriate (landing CTA and possibly homepage block).

## Phase 9 — Testing & validation

- Run: `pnpm typecheck`, `pnpm lint`, `pnpm format:fix`.
- Manual checks:
- Submit B2B application and verify DB insert + email.
- Approve application → organization created + invitation sent.
- B2B user sees `/b2b/shop`, B2C user blocked.
- Cart/checkout totals reflect tier pricing.
- Invoice payment method only for B2B.