/** biome-ignore-all lint/style/noNestedTernary: Ignore it */
/** biome-ignore-all lint/style/noMagicNumbers: Ignore it */
"use client";

import { ShoppingCartIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useGetCart } from "@/hooks/use-get-cart";
import { formatPrice } from "@/lib/utils";
import { ProductCartListItem } from "../shared/product-cart-list-item";
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

  const items = cart?.items ?? [];
  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalCents = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
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
      <DrawerContent className="data-[vaul-drawer-direction=right]:w-[90%]">
        <DrawerHeader>
          <DrawerTitle>Košík ({cartItemsCount})</DrawerTitle>
        </DrawerHeader>
        <Separator />
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-2">
            <ShoppingCartIcon className="size-12 text-muted-foreground" />
            <span className="font-medium text-lg text-muted-foreground">
              Váš košík je prázdny
            </span>
          </div>
        ) : (
          <ScrollArea className="w-full flex-1 px-4 py-4">
            <div className="space-y-4">
              {items.map((item) => (
                <ProductCartListItem item={item} key={item.product.id} />
              ))}
            </div>
          </ScrollArea>
        )}

        {items.length > 0 && (
          <>
            <Separator />
            <DrawerFooter>
              <div className="mb-4 flex items-center justify-between font-medium">
                <span>Spolu</span>
                <span>{formatPrice(totalCents / 100)}</span>
              </div>
              <Link
                className={buttonVariants({ size: "lg", className: "w-full" })}
                href={"/checkout" as Route}
              >
                Pokračovať do pokladne
              </Link>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
