"use client";

import { FolderOpenIcon, PlusIcon } from "lucide-react";
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
import { useCreateDraftCategory } from "@/hooks/use-create-draft-category";

export function EmptyState() {
  const { mutate: createDraftCategory, isPending } = useCreateDraftCategory();

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
          onClick={() => createDraftCategory()}
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
