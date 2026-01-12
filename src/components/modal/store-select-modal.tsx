"use client";

import { Loader2, Navigation, StoreIcon } from "lucide-react";
import { use, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DistanceBadge } from "@/components/ui/distance-badge";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Store } from "@/features/stores/queries";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useIsMobile } from "@/hooks/use-mobile";
import { sortStoresByDistance } from "@/lib/geo-utils";
import { cn } from "@/lib/utils";
import { useCustomerStore } from "@/store/customer-store";

type StoreSelectModalProps = {
  storesPromise: Promise<Store[]>;
};

export function StoreSelectModal({ storesPromise }: StoreSelectModalProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const stores = use(storesPromise);
  const { status, position, requestLocation, isLoading } = useGeolocation();

  const setCustomerStore = useCustomerStore(
    (state) => state.actions.setCustomerStore
  );
  const customerStore = useCustomerStore((state) => state.customerStore);

  const handleRequestLocation = () => {
    requestLocation();
  };

  // Show error toast when permission is denied
  if (status === "denied") {
    toast.error("Prístup k polohe bol zamietnutý", {
      description: "Povoľte prístup k polohe v nastaveniach prehliadača.",
      id: "geolocation-denied-modal",
    });
  }

  const storesWithDistance = useMemo(() => {
    if (!position) {
      return stores.map((store) => ({
        ...store,
        distance: null as number | null,
      }));
    }
    return sortStoresByDistance(stores, position.latitude, position.longitude);
  }, [stores, position]);

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

        <Button
          className="w-full"
          disabled={isLoading}
          onClick={handleRequestLocation}
          size="sm"
          variant={position ? "default" : "outline"}
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Navigation className="size-4" />
          )}
          {position ? "Aktualizovať polohu" : "Zobraziť vzdialenosti"}
        </Button>

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
                  {storesWithDistance.map((store) => (
                    <FieldLabel key={store.id}>
                      <Field orientation="horizontal">
                        <FieldContent>
                          <div className="flex items-center gap-2">
                            <FieldTitle>{store.name}</FieldTitle>
                            {store.distance !== null &&
                              store.distance !== undefined &&
                              store.distance !== Number.POSITIVE_INFINITY && (
                                <DistanceBadge
                                  distance={store.distance}
                                  variant="light"
                                />
                              )}
                          </div>
                          <FieldDescription>
                            {store.address
                              ? [store.address.street, store.address.city]
                                  .filter(Boolean)
                                  .join(", ")
                              : store.description?.content?.[0]?.text}
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
