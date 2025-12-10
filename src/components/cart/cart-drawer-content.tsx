import { ShoppingCartIcon } from "lucide-react";
import { getDetailedCart } from "@/lib/cart/queries";
import { ScrollArea } from "../ui/scroll-area";
import { CartDrawerItem } from "./cart-drawer-item";

export async function CartDrawerContent() {
  const items = await getDetailedCart();

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-2">
        <ShoppingCartIcon className="size-12 text-muted-foreground" />
        <span className="font-medium text-lg text-muted-foreground">
          Váš košík je prázdny
        </span>
      </div>
    );
  }
  return (
    <div className="size-full flex-1 overflow-y-auto">
      <ScrollArea className="w-full flex-1 px-4 py-4">
        <div className="flex size-full flex-col gap-4">
          {items.map((item) => (
            <CartDrawerItem item={item} key={item.productId} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
