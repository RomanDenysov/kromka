import { getCartTotals, getDetailedCart } from "@/lib/cart/queries";
import { getProductsByCategory } from "@/lib/queries/products";
import { Skeleton } from "../ui/skeleton";
import { Spinner } from "../ui/spinner";
import { CheckoutListClient } from "./checkout-list-client";

const CHECKOUT_UPSELL_CATEGORY = "trvanlive-potraviny";
const CHECKOUT_UPSELL_LIMIT = 4;

export async function CheckoutList() {
  const items = await getDetailedCart();
  const cartProductIds = new Set(items.map((item) => item.productId));
  const totals = getCartTotals(items);

  // Fetch upsell recommendations
  const categoryProducts = await getProductsByCategory(
    CHECKOUT_UPSELL_CATEGORY
  );
  const upsellProducts =
    categoryProducts
      ?.filter((p) => p.status === "active" && !cartProductIds.has(p.id))
      .slice(0, CHECKOUT_UPSELL_LIMIT) ?? [];

  return (
    <CheckoutListClient
      items={items}
      totals={totals}
      upsellProducts={upsellProducts ?? []}
    />
  );
}

export function CheckoutListSkeleton() {
  return (
    <>
      <div className="hidden flex-col gap-4 md:flex">
        <span className="flex items-center font-semibold text-base md:text-lg">
          Košík (<Spinner className="mr-1.5 size-4" /> položky)
        </span>
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
