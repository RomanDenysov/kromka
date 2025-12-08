"use client";

import { ShoppingCartIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerContent,
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
          <DrawerTitle>Košík</DrawerTitle>
        </DrawerHeader>
        <Separator />
        {children}
      </DrawerContent>
    </Drawer>
  );
}
