"use client";

import { ShoppingCartIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "../cart/cart-context";
import { Button, buttonVariants } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Separator } from "../ui/separator";

type Props = {
  indicator: ReactNode;
  children: ReactNode;
};

export function CartDrawer({ indicator, children }: Props) {
  const [open, setOpen] = useState(false);
  const { cart, itemsCount, totalCents } = useCart();

  const items = cart?.items ?? [];

  return (
    <Drawer direction={"right"} onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button className="relative" size="icon-sm" variant="ghost">
          <ShoppingCartIcon className="size-5" />
          {indicator}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="data-[vaul-drawer-direction=right]:w-[90%]">
        <DrawerHeader>
          <DrawerTitle>Košík ({itemsCount})</DrawerTitle>
        </DrawerHeader>
        <Separator />
        {children}

        {items.length > 0 && (
          <>
            <Separator />
            <DrawerFooter>
              <div className="mb-2 flex items-center justify-between font-medium sm:mb-4">
                <span>Spolu</span>
                <span>{formatPrice(totalCents)}</span>
              </div>
              <DrawerClose asChild>
                <Link
                  className={cn(
                    buttonVariants({ size: "lg", className: "w-full" }),
                    "text-base"
                  )}
                  href={"/pokladna" as Route}
                >
                  Pokračovať do pokladne
                </Link>
              </DrawerClose>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
