import { ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getActiveCarts } from "@/lib/queries/dashboard";
import { getInitials } from "@/lib/utils";

const MAX_ITEMS_DISPLAY = 3;

export default async function AdminCartsPage() {
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
        <Card key={cart.id}>
          <CardHeader className="border-b">
            {cart.user ? (
              <div className="flex flex-row items-center gap-2">
                <Avatar className="size-8">
                  <AvatarImage
                    alt={cart.user?.name ?? "Neznámy zákazník"}
                    src={cart.user?.image ?? undefined}
                  />
                  <AvatarFallback>
                    {getInitials(cart.user?.name ?? "A")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-sm">
                    {cart.user?.name ?? "Neznámy zákazník"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    <span className="truncate text-muted-foreground">
                      {cart.user?.email}
                    </span>
                  </CardDescription>
                </div>
              </div>
            ) : (
              <CardTitle className="text-sm">Neznámy zákazník</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-1 flex-col justify-between">
              <div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs">
                <ShoppingCartIcon className="size-3" />
                <span>{cart.items.length} položiek</span>
              </div>
              <ul className="space-y-1 text-sm">
                {cart.items.slice(0, MAX_ITEMS_DISPLAY).map((item) => (
                  <li
                    className="flex justify-between gap-2"
                    key={item.productId}
                  >
                    <span className="truncate text-muted-foreground">
                      {item.product.name}
                    </span>

                    <span className="font-medium">x{item.quantity}</span>
                  </li>
                ))}
                {cart.items.length > MAX_ITEMS_DISPLAY && (
                  <li>
                    <span className="truncate text-muted-foreground text-xs">
                      +{cart.items.length - MAX_ITEMS_DISPLAY} položiek
                    </span>
                  </li>
                )}
                {cart.items.length === 0 && (
                  <li className="text-muted-foreground italic">
                    Prázdny košík
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="mt-auto items-center justify-center">
            <Link
              className={buttonVariants({ variant: "link", size: "xs" })}
              href={`/admin/carts/${cart.id}`}
              prefetch
            >
              Zobraziť viac &gt;
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
