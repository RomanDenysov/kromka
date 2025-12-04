import { FolderOpenIcon, PlusIcon } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { createDraftCategoryAction } from "@/lib/actions/categories";

export function EmptyState() {
  const [isPending, startTransition] = useTransition();

  const handleCreateDraftCategory = () =>
    startTransition(async () => {
      await createDraftCategoryAction();
    });

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
        <Button
          disabled={isPending}
          onClick={handleCreateDraftCategory}
          size="sm"
          variant="outline"
        >
          {isPending ? (
            <>
              <Spinner />
              Pridávame kategóriu...
            </>
          ) : (
            <>
              <PlusIcon />
              Pridať novú kategóriu
            </>
          )}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
