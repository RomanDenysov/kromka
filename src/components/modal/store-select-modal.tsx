"use client";

import { useEffect, useTransition } from "react";
import { setUserStore } from "@/lib/actions/stores";
import { useSelectedStore } from "@/stores/selected-store";
import type { Store } from "@/types/store";
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
  currentStoreId: string | null;
};

export function StoreSelectModal({
  stores,
  currentStoreId,
}: StoreSelectModalProps) {
  const [_isPending, startTransition] = useTransition();

  const {
    store: selectedStore,
    setStore,
    isModalOpen,
    setModalOpen,
  } = useSelectedStore();

  useEffect(() => {
    if (currentStoreId && !selectedStore) {
      const serverStore = stores.find((s) => s.id === currentStoreId);
      if (serverStore) {
        setStore({ id: serverStore.id, name: serverStore.name });
      }
    }
  }, [currentStoreId, stores, selectedStore, setStore]);

  const handleSelect = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    if (!store) {
      return;
    }

    // Optimistic — сразу обновляем UI
    setStore({ id: store.id, name: store.name });
    setModalOpen(false);

    startTransition(async () => {
      try {
        await setUserStore(storeId);
      } catch (error) {
        // Rollback
        const prevStore = currentStoreId
          ? stores.find((s) => s.id === currentStoreId)
          : null;
        setStore(prevStore ? { id: prevStore.id, name: prevStore.name } : null);
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.error(error);
      }
    });
  };

  return (
    <Dialog onOpenChange={setModalOpen} open={isModalOpen}>
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
                  onValueChange={(value) => handleSelect(value)}
                  value={selectedStore?.id ?? ""}
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
