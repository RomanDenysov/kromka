/** biome-ignore-all lint/style/noNestedTernary: Ignore it */
/** biome-ignore-all lint/style/noMagicNumbers: Ignore it */
"use client";

import { ShoppingCartIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useGetCart } from "@/hooks/use-get-cart";
import { cn, formatPrice } from "@/lib/utils";
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
  const { data: cart, isLoading } = useGetCart();

  const items = cart?.items ?? [];
  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalCents = items.reduce(
    (acc, item) => acc + item.priceCents * item.quantity,
    0
  );

  return (
    <Drawer direction={"right"}>
      <DrawerTrigger asChild>
        <Button
          className="relative"
          disabled={isLoading}
          size="icon-sm"
          variant="ghost"
        >
          <ShoppingCartIcon className="size-5" />
          <span className="sr-only">Košík</span>
          {isLoading && (
            <span className="-top-1.5 -right-1.5 absolute size-4 rounded-full bg-muted" />
          )}
          {cartItemsCount > 0 && (
            <Badge
              className={cn(
                "-top-1.5 -right-1.5 absolute aspect-square h-4 w-auto px-0.5 py-0 font-semibold text-[10px]"
              )}
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
                <ProductCartListItem
                  key={item.product.id}
                  product={item.product}
                  quantity={item.quantity}
                />
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
                <span>{formatPrice(totalCents)}</span>
              </div>
              <Link
                className={cn(
                  buttonVariants({ size: "lg", className: "w-full" }),
                  "text-base"
                )}
                href={"/pokladna" as Route}
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
