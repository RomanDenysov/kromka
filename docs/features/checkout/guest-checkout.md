# Guest Checkout

How the checkout flow handles guest vs authenticated users, cookie storage, and data privacy.

## Authentication Modes

| Mode | Customer Data Source | Order Linking |
|------|---------------------|---------------|
| **Authenticated** | User record in DB | `createdBy` relation |
| **Guest** | `customerInfo` JSONB on order | Cookie-based tracking |

## Cookie-Based Data Storage

Guest order tracking uses a single httpOnly cookie (accessible only server-side, protected from XSS):

| Cookie | Content | Max Age | Purpose |
|--------|---------|---------|---------|
| `krmk-last-order` | `"ord_xxx"` (order ID) | 365 days | Last order ID for prefill |

### Why httpOnly Cookies?

- **XSS-safe**: JavaScript cannot access httpOnly cookies
- **Consistent**: Same pattern as cart storage (`krmk-kosik`)
- **Automatic expiration**: Browser handles cleanup
- **Minimal data**: Only order ID stored, not PII

## Prefill Strategy

Customer info and store selection are prefilled from the last order:

### Guests
```
Cookie: krmk-last-order = "ord_xxx"
        │
        ▼
Fetch order from DB by ID
        │
        ▼
Extract customerInfo + storeId for prefill
```

### Authenticated Users
```
Query last order by userId from DB
        │
        ▼
Extract customerInfo + storeId for prefill
```

**Key point**: No PII stored in cookies - all customer data comes from order records.

## Server Actions

All data operations are handled via server actions in `src/features/checkout/actions.ts`:

| Action | Purpose |
|--------|---------|
| `getLastOrderPrefillAction(userId?)` | Get last order prefill data (customerInfo + storeId) |
| `setLastOrderIdAction(orderId)` | Set last order ID in cookie (guests only) |
| `getLastOrderWithItemsAction(userId?)` | Get last order with items for "repeat order" |

### `getLastOrderPrefillAction`

```typescript
// For guests: reads from krmk-last-order cookie
// For authenticated users: queries by userId
// Returns { customerInfo, storeId } or null
```

## Data Flow

```
page.tsx (server)
  └── getDetailedCart() + getStores() + getUserDetails() + getLastOrderPrefillAction(userId)
        └── Pass lastOrderPrefill as prop to CheckoutForm
              └── CustomerInfoCard uses lastOrderPrefill.customerInfo for initial values
              └── useCheckoutForm uses lastOrderPrefill.storeId for initial store
              └── useCheckoutForm handles submission
                    └── createOrderFromCart() → setLastOrderIdAction() (guests only)
```

## Privacy Considerations

| Concern | Solution |
|---------|----------|
| **No PII in cookies** | Only order ID stored (minimal data) |
| **Prefill from orders** | Customer info comes from order records |
| **Order ID persistence** | Cookie expires after 1 year |
| **Authenticated users** | No cookies needed - query DB directly |

## Migration Notes (2026)

**Before:**
- Multiple cookies (`krmk-guest`, `krmk-store`, `krmk-orders` array)
- Zustand store for client state
- User-store relation in DB

**After:**
- Single `krmk-last-order` cookie (order ID only)
- No client state
- No user-store relation

**Benefits:**
- Less cookie data
- Simpler architecture
- Stores treated as content/pickup entities only
