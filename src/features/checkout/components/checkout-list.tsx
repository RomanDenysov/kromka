import { Skeleton } from "@/components/ui/skeleton";
import { getCartTotals, getDetailedCart } from "@/features/cart/queries";
import { CheckoutListClient } from "./checkout-list-client";
import { CheckoutListItem } from "./checkout-list-item";

export async function CheckoutList() {
  const items = await getDetailedCart();
  const totals = getCartTotals(items);

  return (
    <CheckoutListClient totals={totals}>
      <div className="mt-2 flex flex-col gap-2 md:mt-0">
        {items.map((item) => (
          <CheckoutListItem item={item} key={item.productId} />
        ))}
      </div>
    </CheckoutListClient>
  );
}

export function CheckoutListSkeleton() {
  return (
    <>
      <div className="hidden flex-col gap-4 md:flex">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              className="flex size-full min-h-24 flex-row gap-2 rounded-md border p-3"
              key={`skeleton-${index.toString()}`}
            >
              <Skeleton className="size-[100px] rounded-sm" />
              <div className="flex flex-1 flex-col justify-between gap-2">
                <div className="flex flex-row items-center justify-between gap-2">
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="size-7 rounded" />
                </div>
                <div className="flex flex-row items-center justify-between gap-2">
                  <Skeleton className="h-7 w-1/4" />
                  <Skeleton className="h-7 w-20 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Skeleton className="block h-20 w-full md:hidden" />
    </>
  );
}
