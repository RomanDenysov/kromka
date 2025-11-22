/** biome-ignore-all lint/style/noNestedTernary: Ignore it */
/** biome-ignore-all lint/style/noMagicNumbers: Ignore it */
"use client";

import { MinusIcon, PlusIcon, ShoppingCartIcon, TrashIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useDebouncedCallback } from "use-debounce";
import { useCartActions } from "@/hooks/use-cart-actions";
import { useGetCart } from "@/hooks/use-get-cart";
import { formatPrice } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button, buttonVariants } from "../ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

export function CartDrawer() {
  const { data: cart } = useGetCart();
  const { removeFromCart, updateQuantity } = useCartActions();

  const items = cart?.items ?? [];
  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalCents = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const debouncedUpdateQuantity = useDebouncedCallback(
    (productId: string, quantity: number) => {
      updateQuantity({ productId, quantity });
    },
    500
  );

  return (
    <Drawer direction={"right"}>
      <DrawerTrigger asChild>
        <Button className="relative" size="icon-sm" variant="ghost">
          <ShoppingCartIcon className="size-5" />
          <span className="sr-only">Košík</span>
          {cartItemsCount > 0 && (
            <Badge
              className="-top-1.5 -right-1.5 absolute h-4 px-0.5 py-0 text-[10px]"
              variant="default"
            >
              {cartItemsCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Košík ({cartItemsCount})</DrawerTitle>
        </DrawerHeader>

        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-2">
            <ShoppingCartIcon className="size-12 text-muted-foreground" />
            <span className="font-medium text-lg text-muted-foreground">
              Váš košík je prázdny
            </span>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4">
              {items.map((item) => (
                <div className="flex gap-4" key={item.productId}>
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="font-medium text-sm">
                      {item.product?.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatPrice(item.price / 100)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-medium text-sm">
                      {formatPrice((item.price * item.quantity) / 100)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        className="h-6 w-6"
                        onClick={() => {
                          if (item.quantity > 1) {
                            debouncedUpdateQuantity(
                              item.productId,
                              item.quantity - 1
                            );
                          } else {
                            removeFromCart({ productId: item.productId });
                          }
                        }}
                        size="icon"
                        variant="outline"
                      >
                        <MinusIcon className="size-3" />
                      </Button>
                      <span className="w-4 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        className="h-6 w-6"
                        onClick={() =>
                          debouncedUpdateQuantity(
                            item.productId,
                            item.quantity + 1
                          )
                        }
                        size="icon"
                        variant="outline"
                      >
                        <PlusIcon className="size-3" />
                      </Button>
                      <Button
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          removeFromCart({ productId: item.productId })
                        }
                        size="icon"
                        variant="ghost"
                      >
                        <TrashIcon className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {items.length > 0 && (
          <div className="p-4">
            <Separator className="mb-4" />
            <div className="mb-4 flex items-center justify-between font-medium">
              <span>Spolu</span>
              <span>{formatPrice(totalCents / 100)}</span>
            </div>
            <DrawerFooter className="p-0">
              <Link
                className={buttonVariants({ size: "lg", className: "w-full" })}
                href={"/checkout" as Route}
              >
                Pokračovať do pokladne
              </Link>
            </DrawerFooter>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
