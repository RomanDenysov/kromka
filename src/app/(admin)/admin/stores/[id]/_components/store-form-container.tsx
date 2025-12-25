"use client";

import { StoreForm } from "@/app/(admin)/admin/stores/[id]/_components/store-form";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import type { AdminStore } from "@/lib/queries/stores";

type Props = {
  store: AdminStore;
};

export function StoreFormContainer({ store }: Props) {
  return (
    <StoreForm store={store}>
      {({ isPending }) => (
        <div className="flex items-center justify-end gap-2">
          <Button disabled={isPending} size="sm" type="submit">
            Uložiť
            {isPending ? <Spinner /> : <Kbd>↵</Kbd>}
          </Button>
        </div>
      )}
    </StoreForm>
  );
}
