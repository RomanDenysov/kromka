import { ShoppingCartIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getDetailedCart } from "@/features/cart/api/queries";
import { getUserDetails } from "@/lib/auth/session";
import { CartDrawerItem } from "./cart-drawer-item";

export async function CartDrawerContent() {
  const user = await getUserDetails();
  const priceTierId =
    user?.members && user.members.length > 0
      ? (user.members[0]?.organization?.priceTierId ?? null)
      : null;
  const items = await getDetailedCart(priceTierId);

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
