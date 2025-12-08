"use client";

import { StoreIcon } from "lucide-react";
import { use, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Store } from "@/lib/queries/stores";
import { cn } from "@/lib/utils";
import { useCustomerStore } from "@/store/customer-store";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "../ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { ScrollArea } from "../ui/scroll-area";

type StoreSelectModalProps = {
  storesPromise: Promise<Store[]>;
};

export function StoreSelectModal({ storesPromise }: StoreSelectModalProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const stores = use(storesPromise);

  const setCustomerStore = useCustomerStore(
    (state) => state.actions.setCustomerStore
  );
  const customerStore = useCustomerStore((state) => state.customerStore);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            isMobile
              ? "w-full justify-start gap-3 has-[>svg]:px-3"
              : "hidden w-auto md:inline-flex"
          )}
          size={isMobile ? "xl" : "sm"}
          type="button"
          variant="outline"
        >
          <StoreIcon className={cn(isMobile ? "size-6" : "size-4")} />
          {customerStore ? customerStore.name : "Vybrať predajňu"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vyberte predajňu</DialogTitle>
          <DialogDescription>
            Vyberte predajňu, v ktorej chcete nakupovať.
          </DialogDescription>
        </DialogHeader>
        <div className="grow">
          <ScrollArea className="h-80 pr-2.5">
            <FieldGroup>
              <FieldSet>
                <RadioGroup
                  onValueChange={(value) =>
                    setCustomerStore({
                      id: value,
                      name: stores.find((s) => s.id === value)?.name ?? "",
                    })
                  }
                  value={customerStore?.id ?? null}
                >
                  {stores.map((store) => (
                    <FieldLabel key={store.id}>
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>{store.name}</FieldTitle>
                          <FieldDescription>
                            {store.description?.content?.[0]?.text}
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem id={store.id} value={store.id} />
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
              </FieldSet>
            </FieldGroup>
          </ScrollArea>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button size="sm" type="button" variant="outline">
              Zavrieť
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
