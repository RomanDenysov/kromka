# Checkout Feature

B2C checkout flow for the bakery e-shop. Handles cart review, customer info, pickup scheduling, payment selection, and order creation.

## Documentation

| Document | Description |
|----------|-------------|
| [Guest Checkout](./guest-checkout.md) | Authentication modes, cookies, data privacy |
| [Pickup Scheduling](./pickup-scheduling.md) | Date/time validation, store schedules, restrictions |
| [Last Order](./last-order.md) | "Repeat order" feature for returning customers |
| [Changelog](./changelog.md) | Version history and migration notes |

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
Products can have category-level pickup date restrictions. When multiple restricted products are in cart, only the **intersection** of allowed dates is available. See [Pickup Scheduling](./pickup-scheduling.md).

### Cutoff Time
Orders placed before 12:00 can be picked up tomorrow. After 12:00, pickup starts day-after-tomorrow. See [Pickup Scheduling](./pickup-scheduling.md).

### Guest vs Authenticated Checkout
- **Authenticated**: User data from DB, linked via `createdBy` relation
- **Guest**: Data stored in `customerInfo` JSONB field on order

See [Guest Checkout](./guest-checkout.md) for details.

## Hooks

### `useCheckoutForm`
Manages form state (React Hook Form), store/date/time coordination effects, and order submission.

### `useCheckoutValidation`
Validates user/guest contact info against `userInfoSchema`. Returns `isUserInfoValid` and computed `userInfo`.

### `usePickupRestrictions`
Computes restricted pickup dates from cart items' categories. Returns `restrictedPickupDates` Set.

## Related Features

- `src/features/cart/` - Cart cookie storage, queries, and "repeat order" batch add action
- `src/features/checkout/cookies.ts` - Secure guest info, store, and order history cookies
- `src/features/checkout/actions.ts` - Server actions for data access and order fetching
- `src/features/orders/` - Order creation and management
- `src/features/stores/` - Store data and schedules
