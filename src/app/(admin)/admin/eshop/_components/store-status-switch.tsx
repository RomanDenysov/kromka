"use client";

import { LoaderIcon } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import type { AdminStore } from "@/features/stores/api/queries";
import { cn } from "@/lib/utils";
import { updateStoreStatusAction } from "./actions";

export function StoreStatusSwitch({ store }: { store: AdminStore }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimisticState] = useOptimistic(store.isActive);

  const updateStoreStatus = () =>
    startTransition(async () => {
      setOptimisticState(!optimisticState);
      await updateStoreStatusAction(store.id);
    });

  return (
    <Badge size="sm" variant="secondary">
      <Field orientation="horizontal">
        <FieldLabel htmlFor={`open-${store.id}`}>
          {isPending ? (
            <LoaderIcon className="size-2.5 animate-spin text-muted-foreground" />
          ) : (
            <span
              className={cn(
                "size-2 animate-pulse rounded-full transition-colors duration-200",
                optimisticState ? "bg-green-500" : "bg-red-500"
              )}
            />
          )}
          {optimisticState ? "Aktívny" : "Neaktívny"}
        </FieldLabel>
        <Switch
          checked={optimisticState}
          id={`open-${store.id}`}
          onCheckedChange={updateStoreStatus}
          size="sm"
        />
      </Field>
    </Badge>
  );
}
