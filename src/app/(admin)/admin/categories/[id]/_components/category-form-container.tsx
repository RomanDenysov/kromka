"use client";

import { CategoryForm } from "@/app/(admin)/admin/categories/[id]/_components/category-form";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import type { AdminCategory } from "@/features/categories/api/queries";

type Props = {
  category: AdminCategory;
};

export function CategoryFormContainer({ category }: Props) {
  return (
    <CategoryForm category={category}>
      {({ isPending }) => (
        <div className="flex items-center justify-end gap-2">
          <Button disabled={isPending} size="sm" type="submit">
            Uložiť
            {isPending ? <Spinner /> : <Kbd>↵</Kbd>}
          </Button>
        </div>
      )}
    </CategoryForm>
  );
}
