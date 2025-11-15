import { useCallback } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/components/shared/form";
import type { Store } from "@/types/store";
import { storeSchema } from "@/validation/stores";
import { useUpdateStore } from "../mutations/use-update-store";

export function useStoreForm(store: Store) {
  const { mutateAsync: updateStore, isPending: isPendingUpdateStore } =
    useUpdateStore({
      onSuccess: () => {
        toast.success("Obchod aktualizovaný");
        form.reset(form.state.values);
      },
      onError: () => {
        toast.error("Nastala chyba pri aktualizácii obchodu");
      },
    });

  const handleSubmit = useCallback(
    async ({ value }: { value: Store }) => {
      await updateStore({
        id: value.id,
        store: {
          ...value,
          description: value.description,
        },
      });
    },
    [updateStore]
  );

  const form = useAppForm({
    defaultValues: {
      ...store,
    },
    validators: {
      onSubmit: storeSchema,
    },
    onSubmit: handleSubmit,
  });

  return {
    form,
    isPending: isPendingUpdateStore || form.state.isSubmitting,
  };
}
