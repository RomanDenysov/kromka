import { useMemo } from "react";
import type { DetailedCartItem } from "@/features/cart/queries";
import { getRestrictedPickupDates } from "@/features/checkout/utils";

/**
 * Hook to compute pickup date restrictions based on cart items.
 * Returns the set of restricted dates from cart item categories.
 */
export function usePickupRestrictions(items: DetailedCartItem[]) {
  // Compute restricted pickup dates from cart items' categories
  const restrictedPickupDates = useMemo(
    () => getRestrictedPickupDates(items),
    [items]
  );

  return { restrictedPickupDates };
}
