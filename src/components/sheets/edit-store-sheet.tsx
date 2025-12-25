"use client";

import { SquareArrowOutUpLeftIcon } from "lucide-react";
import Link from "next/link";
import { StoreForm } from "@/app/(admin)/admin/stores/[id]/_components/store-form";
import { useStoreParams } from "@/hooks/use-store-params";
import type { AdminStore } from "@/lib/queries/stores";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { Kbd } from "../ui/kbd";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Spinner } from "../ui/spinner";

export function EditStoreSheet({ store }: { store: AdminStore }) {
  const [{ storeId }, setSearchParams] = useStoreParams();

  if (!storeId) {
    return null;
  }

  return (
    <Sheet
      onOpenChange={(open) => !open && setSearchParams({ storeId: null })}
      open
    >
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle>Upraviť obchod</SheetTitle>
          <SheetDescription>{storeId}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <StoreForm store={store}>
            {({ isPending }) => (
              <SheetFooter className="sticky bottom-0 mt-auto flex-row border-t bg-background">
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "ml-auto"
                  )}
                  href={`/admin/stores/${storeId}`}
                >
                  <SquareArrowOutUpLeftIcon />
                  Otvoriť
                </Link>
                <Button disabled={isPending} size="sm" type="submit">
                  Uložiť
                  {isPending ? <Spinner /> : <Kbd>↵</Kbd>}
                </Button>
              </SheetFooter>
            )}
          </StoreForm>
        </div>
      </SheetContent>
    </Sheet>
  );
}
