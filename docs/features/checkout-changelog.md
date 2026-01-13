# Checkout Feature Changelog

## 2026-01-12 - Major Refactoring

### Summary
Complete architectural refactoring of the checkout feature to improve maintainability, performance, and code organization.

### Changes

#### Dead Code Removed (343 lines)
- Deleted `src/lib/checkout-utils.ts` (306 lines) - was complete duplicate of `checkout/utils.ts`
- Deleted `price-info.tsx` (10 lines) - unused component
- Deleted `checkout-total-price.tsx` (27 lines) - unused component

#### New Hooks Created
- `use-checkout-form.ts` - Form state management, effects, submission logic
- `use-checkout-validation.ts` - User/guest info validation
- `use-pickup-restrictions.ts` - Category-based date restriction computation

#### New Components Created
- `checkout-alerts.tsx` - Consolidated error/warning messages
- `checkout-mobile-footer.tsx` - Mobile sticky submit button
- `checkout-summary-card.tsx` - Total price display
- `pickup-details-card.tsx` - Store, date, time selection card
- `payment-method-card.tsx` - Payment method selection card

#### Refactored Components
- `checkout-form.tsx`: 597 → 202 lines (66% reduction)
- `user-info-section.tsx` → renamed to `customer-info-card.tsx`
- `checkout-list.tsx`, `checkout-cart-header.tsx`, `checkout-recommendations.tsx`: Now receive props instead of fetching data

#### Performance Improvements
- **Cart queries reduced from 4 to 1 per page load**
- Single `CheckoutDataLoader` in page.tsx fetches all data and passes to children

#### Architecture Changes
- Business logic extracted to custom hooks (testable in isolation)
- Components follow single responsibility principle
- Clear separation: hooks for logic, components for UI
- Props drilling instead of duplicate data fetching

### Migration Notes
- `CustomerInfoSection` renamed to `CustomerInfoCard` - update imports if used elsewhere
- Components now expect props instead of fetching internally
- `getDetailedCart()` should be called once at page level

---

## 2026-01-13 - Store Sync & Validation Fixes

### Summary
Fixed three critical issues in checkout flow: Zustand→RHF sync, storeId validation, and guest PII retention.

### Changes

#### New Component Created
- `customer-store-sync.tsx` - Centralized sync component following `AuthIdentitySync` pattern
  - Syncs auth user's storeId to Zustand on login
  - Validates persisted storeId (clears if deleted)
  - Expires guest info after 30 days
  - Syncs store selection to PostHog for analytics

#### Customer Store Updates
- Added `guestInfoSavedAt` timestamp tracking
- New actions: `clearGuestInfo()`, `clearStaleStore()`
- New selector: `useGuestInfoSavedAt()`
- Development sanity checks for store shape validation

#### Checkout Form Hook Updates
- Added Zustand→RHF sync effect (when user changes store via global modal)
- Clear guest PII after successful order creation
- Simplified validation (handled upstream by sync component)

#### Server-Side Validation
- Added storeId existence check in `createOrderFromCart` (defense in depth)

### Architecture Improvements
- Centralized sync logic in header component (single source of truth)
- Follows existing `AuthIdentitySync` pattern for consistency
- Privacy-compliant guest data retention (auto-clear + expiration)

### Migration Notes
- No breaking changes - all changes are additive
- Guest info now expires after 30 days automatically
- Store selection syncs automatically when changed via global modal
