"use client";

import { useTransition } from "react";
import { setUserStore } from "@/lib/actions/stores";
import type { Store } from "@/lib/queries/stores";
import { useCustomerDataStore } from "@/store/customer-data-store";
import { useSelectedModalStore } from "@/store/selecte-store-modal";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  stores: Store[];
};

export function StoreSelectModal({ stores }: StoreSelectModalProps) {
  const [isPending, startTransition] = useTransition();
  const { isOpen, setIsOpen } = useSelectedModalStore();

  const setCustomerStore = useCustomerDataStore(
    (state) => state.actions.setCustomerStore
  );
  const customerStore = useCustomerDataStore((state) => state.customerStore);

  const handleSelect = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    if (!store) {
      return;
    }

    // Optimistic — сразу обновляем UI
    setCustomerStore({ id: store.id, name: store.name });
    setIsOpen(false);

    startTransition(async () => {
      try {
        await setUserStore(storeId);
      } catch (error) {
        // Rollback
        setCustomerStore(
          customerStore
            ? { id: customerStore.id, name: customerStore.name }
            : null
        );
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.error(error);
      }
    });
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
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
                  disabled={isPending}
                  onValueChange={(value) => handleSelect(value)}
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
