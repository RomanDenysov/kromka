# Checkout Feature

B2C checkout flow for the bakery e-shop. Handles cart review, customer info, pickup scheduling, payment selection, and order creation.

## Architecture

```
checkout/
├── hooks/
│   ├── use-checkout-form.ts      # Form state, effects, submission
│   ├── use-checkout-validation.ts # User info validation
│   └── use-pickup-restrictions.ts # Category-based date restrictions
├── components/
│   ├── checkout-form.tsx         # Main form orchestrator (~200 lines)
│   ├── pickup-details-card.tsx   # Store, date, time selection
│   ├── payment-method-card.tsx   # Payment method selection
│   ├── checkout-alerts.tsx       # Error/warning messages
│   ├── checkout-mobile-footer.tsx# Mobile sticky submit button
│   ├── checkout-summary-card.tsx # Total price display
│   ├── customer-info-card.tsx    # Auth/guest contact info
│   ├── checkout-list.tsx         # Cart items display
│   ├── checkout-list-client.tsx  # Mobile collapsible wrapper
│   ├── checkout-list-item.tsx    # Single cart item
│   ├── checkout-cart-header.tsx  # "Cart (X items)" header
│   ├── checkout-recommendations.tsx # Upsell products
│   └── remove-item-button.tsx    # Remove from cart button
├── schema.ts                     # Zod validation schemas
└── utils.ts                      # Date/time calculation utilities
```

## Key Concepts

### Pickup Date Restrictions
Products can have category-level pickup date restrictions. When multiple restricted products are in cart, only the **intersection** of allowed dates is available. See `utils.ts:getRestrictedPickupDates()`.

### Cutoff Time
Orders placed before 12:00 can be picked up tomorrow. After 12:00, pickup starts day-after-tomorrow. See `utils.ts:ORDER_CUTOFF_HOUR`.

### Guest vs Authenticated Checkout
- **Authenticated**: User data from DB, linked via `createdBy` relation
- **Guest**: Data stored in `customerInfo` JSONB field on order, persisted in httpOnly cookie via `src/features/checkout/cookies.ts`

### Cookie-Based Data Storage (Secure)

Guest data is now stored in secure httpOnly cookies (accessible only server-side, protected from XSS):

| Cookie | Content | Max Age | Cleared | Purpose |
|--------|---------|---------|---------|---------|
| `krmk-guest` | `{name, email, phone}` | 30 days | After order | Pre-fill checkout form |
| `krmk-store` | `{storeId, storeName}` | 365 days | Never | Remember store selection |
| `krmk-orders` | `["ord_xxx", ...]` (max 10) | 365 days | Never | Order history for pre-fill |

**Why httpOnly cookies?**
- XSS-safe: JavaScript cannot access httpOnly cookies
- Consistent with cart storage pattern (`krmk-kosik`)
- Automatic expiration support
- No additional DB queries needed

### Server Actions for Data Access

All cookie operations are handled via server actions in `src/features/checkout/actions.ts`:

- `saveGuestInfoAction(info)` - Save guest PII after form changes
- `getGuestInfoAction()` - Retrieve guest PII for display
- `clearGuestInfoAction()` - Clear PII after successful order
- `saveSelectedStoreAction(store)` - Save store selection
- `addOrderToHistoryAction(orderId)` - Add order to history (guest tracking)
- `getLastOrderInfoAction()` - Get most recent order for pre-fill
- `getLastOrderWithItemsAction()` - Get last order with items for "repeat order" feature

### Last Order / "Repeat Order" Feature

Returning customers can quickly repeat their last order from the cart drawer. This feature is powered by the order history cookie (`krmk-orders`).

**How it works:**
1. User opens the cart drawer (top-right shop icon)
2. Below their current cart items, a "Last Order" card appears (if order history exists)
3. Card shows 2-3 items from the most recent order with current prices
4. Clicking "Zopakovať objednávku" (Repeat Order) button:
   - Adds all items from last order to the current cart
   - Preserves original quantities
   - Uses current product prices (not historical prices)
   - Redirects to checkout page immediately

**Location:** `src/features/cart/components/last-order-card.tsx`

**Server-side logic:**
- `getLastOrderWithItemsAction()` fetches the most recent order from history
- Filters out deleted/draft products to prevent errors
- Returns null if no valid items exist (card is hidden)
- Uses batch `addItemsToCart()` action for efficient cart updates

**Edge cases:**
- Card is hidden if user has no order history
- Card is hidden if all items from last order are no longer available
- Products shown with current prices, not historical prices (user expectation)
- Merges with existing cart items (doesn't replace)

### Customer Store Sync

The `CustomerStoreSync` component (in header) handles centralized sync and validation:
- **Auth user sync**: User's preferred store synced to Zustand on login
- **Store validation**: Clears localStorage if persisted store was deleted
- **PostHog sync**: Store selection tracked as person property for analytics segmentation

### Guest Data Privacy
- PII stored only in httpOnly cookies (not accessible to JavaScript)
- **Cleared automatically** after successful order creation
- **Expires** after 30 days of inactivity
- Order history (IDs only) persists for 1 year to enable pre-fill on future visits

### Data Flow
```
page.tsx (server)
  └── getDetailedCart() + getStores() + getUserDetails() + getGuestInfoAction()
        └── Pass data as props to CheckoutForm
              └── CustomerInfoCard reads/saves guestInfo via server actions
              └── useCheckoutForm handles submission
                    └── createOrderFromCart() → addOrderToHistory() + clearGuestInfo()
```

## Hooks

### `useCheckoutForm`
Manages form state (React Hook Form), store/date/time coordination effects, and order submission.

### `useCheckoutValidation`
Validates user/guest contact info against `userInfoSchema`. Returns `isUserInfoValid` and computed `userInfo`.

### `usePickupRestrictions`
Computes restricted pickup dates from cart items' categories. Returns `restrictedPickupDates` Set.

## Migration Notes

**2026 Update:** Guest data storage migrated from localStorage (Zustand) to secure httpOnly cookies.

- **Before:** `src/store/customer-store.ts` stored PII in localStorage
- **After:** `src/features/checkout/cookies.ts` uses httpOnly cookies (XSS-safe)
- **Cookie operations:** Handled via `src/features/checkout/actions.ts` (server actions)
- **Order history:** New `krmk-orders` cookie enables pre-fill on repeat visits

## Related Features
- `src/features/cart/` - Cart cookie storage, queries, and "repeat order" batch add action
- `src/features/checkout/cookies.ts` - Secure guest info, store, and order history cookies
- `src/features/checkout/actions.ts` - Server actions for data access and order fetching
- `src/features/orders/` - Order creation and management (now adds to history + clears PII)
- `src/features/stores/` - Store data and schedules
