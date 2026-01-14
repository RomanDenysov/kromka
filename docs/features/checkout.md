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

Guest order tracking uses a single httpOnly cookie (accessible only server-side, protected from XSS):

| Cookie | Content | Max Age | Cleared | Purpose |
|--------|---------|---------|---------|---------|
| `krmk-last-order` | `"ord_xxx"` (single order ID) | 365 days | Never | Last order ID for prefill |

**Why httpOnly cookies?**
- XSS-safe: JavaScript cannot access httpOnly cookies
- Consistent with cart storage pattern (`krmk-kosik`)
- Automatic expiration support
- Minimal data storage (only order ID, not PII)

**Prefill Strategy:**
- **Guests**: Last order ID stored in cookie → fetch order from DB → extract `customerInfo` and `storeId` for prefill
- **Authenticated users**: Query last order by `userId` from DB → extract `customerInfo` and `storeId` for prefill
- No PII stored in cookies - all customer data comes from order records

### Server Actions for Data Access

All data operations are handled via server actions in `src/features/checkout/actions.ts`:

- `getLastOrderPrefillAction(userId?)` - Get last order prefill data (customerInfo + storeId)
  - For guests: reads from `krmk-last-order` cookie
  - For authenticated users: queries by `userId`
  - Returns `{ customerInfo, storeId }` or `null`
- `setLastOrderIdAction(orderId)` - Set last order ID in cookie (for guests only)
- `getLastOrderWithItemsAction(userId?)` - Get last order with items for "repeat order" feature

### Last Order / "Repeat Order" Feature

Returning customers can quickly repeat their last order from the cart drawer. This feature uses the last order ID (from cookie for guests, or DB query for authenticated users).

**How it works:**
1. User opens the cart drawer (top-right shop icon)
2. Below their current cart items, a "Last Order" card appears (if last order exists)
3. Card shows 2-3 items from the most recent order with current prices
4. Clicking "Zopakovať objednávku" (Repeat Order) button:
   - Adds all items from last order to the current cart
   - Preserves original quantities
   - Uses current product prices (not historical prices)
   - Redirects to checkout page immediately

**Location:** `src/features/cart/components/last-order-card.tsx`

**Server-side logic:**
- `getLastOrderWithItemsAction(userId?)` fetches the most recent order:
  - **Guests**: Reads `krmk-last-order` cookie → queries order by ID
  - **Authenticated**: Queries order by `userId` ordered by `createdAt DESC LIMIT 1`
- Filters out deleted/draft products to prevent errors
- Returns null if no valid items exist (card is hidden)
- Uses batch `addItemsToCart()` action for efficient cart updates

**Edge cases:**
- Card is hidden if user has no last order
- Card is hidden if all items from last order are no longer available
- Products shown with current prices, not historical prices (user expectation)
- Merges with existing cart items (doesn't replace)

### Guest Data Privacy
- **No PII in cookies**: Only order ID stored (minimal data)
- **Prefill from orders**: Customer info and store selection come from last order record
- **Order ID persists**: Last order ID cookie expires after 1 year to enable prefill on future visits
- **Authenticated users**: No cookies needed - last order queried directly from DB

### Data Flow
```
page.tsx (server)
  └── getDetailedCart() + getStores() + getUserDetails() + getLastOrderPrefillAction(userId)
        └── Pass lastOrderPrefill as prop to CheckoutForm
              └── CustomerInfoCard uses lastOrderPrefill.customerInfo for initial values
              └── useCheckoutForm uses lastOrderPrefill.storeId for initial store
              └── useCheckoutForm handles submission
                    └── createOrderFromCart() → setLastOrderIdAction() (guests only)
```

## Hooks

### `useCheckoutForm`
Manages form state (React Hook Form), store/date/time coordination effects, and order submission.

### `useCheckoutValidation`
Validates user/guest contact info against `userInfoSchema`. Returns `isUserInfoValid` and computed `userInfo`.

### `usePickupRestrictions`
Computes restricted pickup dates from cart items' categories. Returns `restrictedPickupDates` Set.

## Migration Notes

**2026 Update:** Simplified guest data storage and removed user-store binding.

- **Before:** Multiple cookies (`krmk-guest`, `krmk-store`, `krmk-orders` array), Zustand store for client state, user-store relation in DB
- **After:** Single `krmk-last-order` cookie (order ID only), no client state, no user-store relation
- **Prefill strategy:** Fetch last order from DB (by userId for auth, by cookie ID for guests) → extract customerInfo + storeId
- **Benefits:** Less cookie data, simpler architecture, stores treated as content/pickup entities only

## Related Features
- `src/features/cart/` - Cart cookie storage, queries, and "repeat order" batch add action
- `src/features/checkout/cookies.ts` - Secure guest info, store, and order history cookies
- `src/features/checkout/actions.ts` - Server actions for data access and order fetching
- `src/features/orders/` - Order creation and management (now adds to history + clears PII)
- `src/features/stores/` - Store data and schedules
