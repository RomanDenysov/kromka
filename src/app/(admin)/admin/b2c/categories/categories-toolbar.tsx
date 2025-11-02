import { PackagePlusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CategoriesToolbar() {
  return (
    <div className="flex items-center gap-2">
      <Button size="xs" variant="outline">
        <PlusIcon />
        Pridať kategóriu
      </Button>
      <Button size="xs" variant="outline">
        <PackagePlusIcon />
        Pridať produkt
      </Button>
    </div>
  );
}
