"use client";

import { ShoppingCartIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
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

export function CartDrawer() {
  const isMobile = useIsMobile();
  const cartItemsCount = 10;

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
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
          <DrawerTitle>Košík</DrawerTitle>
        </DrawerHeader>

        <div className="h-full flex-1" />

        <DrawerFooter>
          <Link
            className={buttonVariants({ size: "sm" })}
            href={"/checkout" as Route}
          >
            Checkout
          </Link>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
