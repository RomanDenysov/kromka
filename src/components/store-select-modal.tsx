"use client";

import { NavigationIcon } from "lucide-react";
import { use, useEffect, useMemo, useTransition } from "react";
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
import { saveSelectedStoreAction } from "@/features/checkout/actions";
import type { Store } from "@/features/stores/queries";
import { useGeolocation } from "@/hooks/use-geolocation";
import { sortStoresByDistance } from "@/lib/geo-utils";
import { useCustomerActions, useSelectedStore } from "@/store/customer-store";
import { useStoreModalState } from "@/store/store-modal-state";
import { Spinner } from "./ui/spinner";

type StoreSelectModalProps = {
  storesPromise: Promise<Store[]>;
};

export function StoreSelectModal({ storesPromise }: StoreSelectModalProps) {
  const stores = use(storesPromise);
  const isOpen = useStoreModalState((state) => state.isOpen);
  const close = useStoreModalState((state) => state.close);
  const { status, position, requestLocation, isLoading } = useGeolocation();

  const { setCustomerStore } = useCustomerActions();
  const customerStore = useSelectedStore();

  const [isPending, startTransition] = useTransition();

  const handleRequestLocation = () => {
    requestLocation();
  };

  // Show error toast when permission is denied
  useEffect(() => {
    if (status === "denied") {
      toast.error("Prístup k polohe bol zamietnutý", {
        description: "Povoľte prístup k polohe v nastaveniach prehliadača.",
        id: "geolocation-denied-modal",
      });
    }
  }, [status]);

  const handleStoreSelect = (storeData: { id: string; name: string }) => {
    // Update Zustand immediately for instant UI feedback
    setCustomerStore(storeData);

    // Persist to cookie in the background via transition
    startTransition(async () => {
      const result = await saveSelectedStoreAction(storeData);

      if (!result.success) {
        toast.error(result.error || "Failed to save store selection");
        // Revert on error (user will need to retry)
        return;
      }

      // Auto-close modal and show success after selection persisted
      close();
      toast.success("Predajňa bola zvolená");
    });
  };

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
    <Dialog onOpenChange={close} open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vyberte predajňu</DialogTitle>
          <DialogDescription>
            Vyberte predajňu, v ktorej chcete nakupovať.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Form submission is handled via onClick on radio items
          }}
        >
          <div className="grow">
            <ScrollArea className="h-80 pr-2 md:pr-2.5">
              <FieldGroup>
                <FieldSet>
                  <RadioGroup value={customerStore?.id ?? ""}>
                    {storesWithDistance.map((store) => {
                      const isSelected = customerStore?.id === store.id;
                      return (
                        <FieldLabel
                          key={store.id}
                          onClick={(e) => {
                            e.preventDefault();
                            if (isSelected) {
                              close();
                            } else {
                              startTransition(async () => {
                                await handleStoreSelect({
                                  id: store.id,
                                  name: store.name,
                                });
                              });
                            }
                          }}
                        >
                          <Field orientation="horizontal">
                            <FieldContent>
                              <div className="flex items-center gap-2">
                                <FieldTitle>{store.name}</FieldTitle>
                                {store.distance !== null &&
                                  store.distance !== undefined &&
                                  store.distance !==
                                    Number.POSITIVE_INFINITY && (
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
                            <RadioGroupItem
                              disabled={isPending}
                              value={store.id}
                            />
                          </Field>
                        </FieldLabel>
                      );
                    })}
                  </RadioGroup>
                </FieldSet>
              </FieldGroup>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button
              className="grow"
              disabled={isLoading || isPending}
              onClick={handleRequestLocation}
              size="sm"
              type="button"
              variant={position ? "default" : "outline"}
            >
              {isLoading ? <Spinner /> : <NavigationIcon />}
              {position ? "Aktualizovať polohu" : "Zobraziť vzdialenosti"}
            </Button>
            <DialogClose asChild>
              <Button
                disabled={isPending}
                size="sm"
                type="button"
                variant="outline"
              >
                Zavrieť
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
