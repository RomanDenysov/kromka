import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDraftCategory } from "../actions/create-draft-category";

export function AddCategoryButton() {
  return (
    <form action={createDraftCategory}>
      <Button className="w-full" size="sm" type="submit" variant="ghost">
        <PlusIcon />
        Add Category
      </Button>
    </form>
  );
}
