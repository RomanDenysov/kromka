import { FolderOpenIcon, PlusIcon } from "lucide-react";
import { createDraftCategory } from "@/app/(admin)/admin/categories/actions";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function EmptyState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpenIcon />
        </EmptyMedia>
        <EmptyTitle>Žiadne výsledky.</EmptyTitle>
        <EmptyDescription>
          Vytvorte novú kategóriu pre vašu predajňu.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <form
          action={async () => {
            await createDraftCategory();
          }}
        >
          <Button size="sm" type="submit" variant="outline">
            <PlusIcon />
            Pridať novú kategóriu
          </Button>
        </form>
      </EmptyContent>
    </Empty>
  );
}
