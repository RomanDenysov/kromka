"use client";

import { MenuIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { User } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { MobileUserButton } from "./mobile-user-button";

type Props = {
  navigation: { name: string; href: Route }[];
  user?: User;
};

export function MobileNavigation({ navigation, user }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Drawer direction="left" onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button
          aria-label="Otvoriť menu"
          className="md:hidden"
          size="icon-sm"
          variant="ghost"
        >
          <MenuIcon className="size-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-center md:text-center">
          <DrawerTitle className="flex items-center justify-center gap-2">
            <Icons.kromka className="h-4 lg:h-5" />
            <span className="sr-only">Kromka Logo</span>
          </DrawerTitle>
        </DrawerHeader>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-3">
            {navigation.map((item) => (
              <Link
                className={cn(
                  buttonVariants({ variant: "secondary", size: "xl" })
                )}
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <DrawerFooter>
          <MobileUserButton user={user ?? null} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
