import { ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import type { ActiveCartsData } from "./dashboard-types";

type Props = {
  carts: ActiveCartsData;
};

const ORDER_ID_DISPLAY_LENGTH = 8;

export function CurrentCarts({ carts }: Props) {
  if (carts.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
        Nemáte žiadne aktuálne košíky.
      </div>
    );
  }

  return (
    <div className="grid gap-3 p-1 sm:grid-cols-2 lg:grid-cols-4">
      {carts.map((cart) => (
        <div
          className="flex h-full flex-col justify-between gap-4 rounded-sm border p-4"
          key={cart.id}
        >
          <div className="flex flex-row items-center gap-4">
            <Avatar className="size-10">
              <AvatarImage
                alt={cart.createdBy?.name ?? "Guest"}
                src={cart.createdBy?.image ?? undefined}
              />
              <AvatarFallback>
                {getInitials(cart.createdBy?.name ?? "G")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 overflow-hidden">
              <h4 className="truncate font-medium text-sm">
                {cart.createdBy?.name || "Guest"}
              </h4>
              <div className="truncate text-muted-foreground text-xs">
                #{cart.orderNumber || cart.id.slice(0, ORDER_ID_DISPLAY_LENGTH)}
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex flex-1 flex-col justify-between">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs">
              <ShoppingCartIcon className="size-3" />
              <span>{cart.items.length} položiek</span>
            </div>
            <ul className="space-y-1 text-sm">
              {cart.items.map((item, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: simple list
                <li className="flex justify-between gap-2" key={index}>
                  <span className="truncate text-muted-foreground">
                    {item.product.name}
                  </span>
                  <span className="font-medium">x{item.quantity}</span>
                </li>
              ))}
              {cart.items.length === 0 && (
                <li className="text-muted-foreground italic">Prázdny košík</li>
              )}
            </ul>
            <div className="mt-auto flex justify-end">
              <Link
                className="text-primary text-xs underline hover:text-primary/80"
                href={`/admin/orders/${cart.id}`}
              >
                Zobraziť detaily
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
