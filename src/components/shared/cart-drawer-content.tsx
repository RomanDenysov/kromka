import { ShoppingCartIcon } from "lucide-react";
import { getCart } from "@/lib/queries/cart";
import { ScrollArea } from "../ui/scroll-area";
import { ProductCartListItem } from "./product-cart-list-item";

export async function CartDrawerContent() {
  const cart = await getCart();
  const items = cart?.items ?? [];
  return items.length === 0 ? (
    <div className="flex h-full flex-col items-center justify-center space-y-2">
      <ShoppingCartIcon className="size-12 text-muted-foreground" />
      <span className="font-medium text-lg text-muted-foreground">
        Váš košík je prázdny
      </span>
    </div>
  ) : (
    <div className="size-full flex-1 overflow-y-auto">
      <ScrollArea className="w-full flex-1 px-4 py-4">
        <div className="flex size-full flex-col gap-4">
          {items.map((item) => (
            <ProductCartListItem
              key={item.product.id}
              product={item.product}
              quantity={item.quantity}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
