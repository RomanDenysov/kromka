import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDraftCategory } from "../actions/create-draft-category";

export function AddCategoryButton() {
  return (
    <form action={createDraftCategory} id="add-category-form">
      <Button
        className="w-full"
        form="add-category-form"
        size="sm"
        type="submit"
        variant="ghost"
      >
        <PlusIcon />
        Add Category
      </Button>
    </form>
  );
}
