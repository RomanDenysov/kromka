import { useCallback } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/components/shared/form";
import type { Category } from "@/types/categories";
import { categoryWithRelationsSchema } from "@/validation/categories";
import { useUpdateCategory } from "../mutations/use-update-category";

export function useCategoryForm({ category }: { category: Category }) {
  const { mutateAsync: updateCategory, isPending: isPendingUpdateCategory } =
    useUpdateCategory({
      onSuccess: () => {
        toast.success("Kategória aktualizovaná");
      },
      onError: (error) => {
        toast.error(
          error?.message || "Nastala chyba pri aktualizácii kategórie"
        );
      },
    });

  const handleSubmit = useCallback(
    async ({ value }: { value: Category }) => {
      await updateCategory({
        id: value.id,
        category: {
          ...value,
          description: value.description || "",
        },
      });
    },
    [updateCategory]
  );

  const form = useAppForm({
    defaultValues: category,
    validators: {
      onSubmit: categoryWithRelationsSchema,
    },
    onSubmit: handleSubmit,
  });

  return {
    form,
    isPending: isPendingUpdateCategory || form.state.isSubmitting,
  };
}
