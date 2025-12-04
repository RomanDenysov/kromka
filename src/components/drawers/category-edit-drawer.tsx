"use client";

import { SquareArrowOutUpLeftIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useCategoryParams } from "@/hooks/use-category-params";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button, buttonVariants } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { Separator } from "../ui/separator";

export function CategoryEditDrawer() {
  const isMobile = useIsMobile();
  const { categoryId, setParams } = useCategoryParams();
  const isOpen = Boolean(categoryId);

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      onOpenChange={(open) => !open && setParams(null)}
      open={isOpen}
    >
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Upraviť kategóriu</DrawerTitle>
          <DrawerDescription>{categoryId}</DrawerDescription>
        </DrawerHeader>
        <Separator />
        <div className="flex-1" />
        <Separator />
        <DrawerFooter className="gap-2 sm:flex-row sm:justify-end">
          <DrawerClose asChild>
            <Button size="sm" variant="outline">
              Zavrieť
            </Button>
          </DrawerClose>
          <Link
            className={buttonVariants({ size: "sm" })}
            href={`categories/${categoryId}` as Route}
            prefetch
          >
            <SquareArrowOutUpLeftIcon />
            Otvoriť
          </Link>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
