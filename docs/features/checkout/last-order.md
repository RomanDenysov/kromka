# Last Order / Repeat Order

Returning customers can quickly repeat their last order from the cart drawer.

## How It Works

1. User opens the cart drawer (top-right shop icon)
2. Below their current cart items, a "Last Order" card appears (if last order exists)
3. Card shows 2-3 items from the most recent order with current prices
4. Clicking "Zopakovať objednávku" (Repeat Order) button:
   - Adds all items from last order to the current cart
   - Preserves original quantities
   - Uses current product prices (not historical prices)
   - Redirects to checkout page immediately

## Location

`src/features/cart/components/last-order-card.tsx`

## Data Flow

### Guests
```
Cookie: krmk-last-order = "ord_xxx"
        │
        ▼
getLastOrderWithItemsAction()
        │
        ▼
Query order by ID
        │
        ▼
Return order with items (filtered for valid products)
```

### Authenticated Users
```
getLastOrderWithItemsAction(userId)
        │
        ▼
Query order by userId ORDER BY createdAt DESC LIMIT 1
        │
        ▼
Return order with items (filtered for valid products)
```

## Server Action

`getLastOrderWithItemsAction(userId?)` in `src/features/checkout/actions.ts`:

- **Guests**: Reads `krmk-last-order` cookie → queries order by ID
- **Authenticated**: Queries order by `userId` ordered by `createdAt DESC LIMIT 1`
- Filters out deleted/draft products to prevent errors
- Returns null if no valid items exist (card is hidden)
- Uses batch `addItemsToCart()` action for efficient cart updates

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User has no last order | Card is hidden |
| All items from last order are deleted | Card is hidden |
| Some items no longer available | Only available items shown |
| User already has items in cart | Items merge (doesn't replace) |

## Price Handling

Products are shown with **current prices**, not historical prices from the order. This is the expected user behavior - they see what they'll pay today, not what they paid before.

## UI Behavior

The "Repeat Order" button:
1. Calls `addItemsToCart()` with all valid items
2. Shows success toast
3. Redirects to `/pokladna` (checkout page)

```typescript
// Simplified flow
const handleRepeatOrder = async () => {
  await addItemsToCart(lastOrder.items.map(item => ({
    productId: item.productId,
    quantity: item.quantity
  })));
  router.push('/pokladna');
};
```
