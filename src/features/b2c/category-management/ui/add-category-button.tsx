import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDraftCategory } from "../actions/create-draft-category";

export function AddCategoryButton() {
  return (
    <form action={createDraftCategory} id="add-category-form">
      <Button
        className="w-full rounded-none"
        form="add-category-form"
        size="sm"
        type="submit"
        variant="ghost"
      >
        <PlusIcon />
        Pridať kategóriu
      </Button>
    </form>
  );
}
