import { MenuIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
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
import { cn } from "@/lib/utils";
import { MobileUserButton } from "./mobile-user-button";

type Props = {
  navigation: { name: string; href: Route }[];
};

export function MobileNavigation({ navigation }: Props) {
  return (
    <Drawer direction="left">
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
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <DrawerFooter>
          <MobileUserButton />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
