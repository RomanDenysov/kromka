"use client";

import { StoreIcon } from "lucide-react";
import { useSelectStore } from "@/hooks/use-select-store";
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
import { Skeleton } from "../ui/skeleton";

export function StoreSelectModal({ children }: { children?: React.ReactNode }) {
  const {
    stores,
    selectedStore,
    setSelectedStore,
    setStore,
    isLoading,
    isPending,
  } = useSelectStore();

  if (isLoading) {
    if (children) {
      return <>{children}</>;
    }
    return <Skeleton className="hidden h-8 w-20 rounded-md md:block" />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button
            className="max-w-[140px] justify-start"
            size="sm"
            variant="secondary"
          >
            <StoreIcon />
            <span className="truncate">
              {selectedStore ? selectedStore.name : "Vybrať obchod"}
            </span>
          </Button>
        )}
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
            <StoreList
              selectedStore={selectedStore}
              setSelectedStore={setSelectedStore}
              stores={stores ?? []}
            />
          </ScrollArea>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button size="sm" type="button" variant="outline">
              Zavrieť
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              disabled={!selectedStore || isPending}
              onClick={() => {
                setStore({ storeId: selectedStore?.id ?? "" });
              }}
              size="sm"
              type="button"
            >
              Vybrať
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StoreList({
  stores,
  selectedStore,
  setSelectedStore,
}: {
  stores: Store[];
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
}) {
  return (
    <FieldGroup>
      <FieldSet>
        <RadioGroup
          onValueChange={(value) =>
            setSelectedStore(stores.find((store) => store.id === value) || null)
          }
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
  );
}
