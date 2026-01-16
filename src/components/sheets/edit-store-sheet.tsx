"use client";

import { formatDate } from "date-fns";
import { SquareArrowOutUpLeftIcon } from "lucide-react";
import Link from "next/link";
import { StoreForm } from "@/app/(admin)/admin/stores/[id]/_components/store-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import type { AdminStore } from "@/features/stores/queries";
import { useStoreParams } from "@/hooks/use-store-params";
import { cn } from "@/lib/utils";

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
          <SheetTitle>{store.name}</SheetTitle>
          <SheetDescription className="text-muted-foreground text-xs">
            Upravené: {formatDate(store.updatedAt, "dd.MM.yyyy HH:mm")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-y-auto">
          <StoreForm className="h-full flex-1" store={store}>
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
