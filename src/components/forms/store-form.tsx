/** biome-ignore-all lint/style/noMagicNumbers: Ignore magic numbers */
"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useUpdateStore } from "@/hooks/mutations/use-update-store";
import type { Store } from "@/types/store";

const _AUTOSAVE_DELAY_MS = 1000;

type Props = {
  store: Store;
};

export function StoreForm({ store }: Props) {
  const { mutateAsync: updateStore } = useUpdateStore({
    onSuccess: () => {
      toast.success("Obchod aktualizovaný");
      form.reset(form.state.values);
    },
  });

  const _handleSubmit = useCallback(
    async ({ value }: { value: Store }) => {
      await updateStore({
        id: store.id,
        store: value,
      });
    },
    [store.id, updateStore]
  );

  return <form />;
}
