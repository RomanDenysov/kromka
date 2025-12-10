import { getActiveCarts } from "@/lib/queries/dashboard";
import { CartDisplayItem } from "./cart-dispay-item";

export async function CartContainer() {
  const carts = await getActiveCarts();
  if (carts.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
        Nemáte žiadne aktuálne košíky.
      </div>
    );
  }

  return (
    <div className="grid gap-3 p-1 sm:grid-cols-3 lg:grid-cols-5">
      {carts.map((cart) => (
        <CartDisplayItem cart={cart} key={cart.id} />
      ))}
    </div>
  );
}
