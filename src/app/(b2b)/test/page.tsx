import { FilterIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TestPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" variant="outline">
          <SearchIcon className="size-4" />
          <span>Search</span>
        </Button>
        <Button size="sm" variant="outline">
          <FilterIcon className="size-4" />
          <span>Filter</span>
        </Button>
      </div>
    </div>
  );
}
