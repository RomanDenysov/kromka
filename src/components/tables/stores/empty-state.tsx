"use client";

import { PlusIcon, StoreIcon } from "lucide-react";
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
import { useCreateDraftStore } from "@/hooks/use-create-draft-store";

export function EmptyState() {
  const { mutate: createDraftStore, isPending } = useCreateDraftStore();

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <StoreIcon />
        </EmptyMedia>
        <EmptyTitle>Žiadne výsledky.</EmptyTitle>
        <EmptyDescription>
          Vytvorte nový obchod pre vašu predajňu.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          disabled={isPending}
          onClick={() => createDraftStore()}
          size="sm"
          variant="outline"
        >
          {isPending ? (
            <>
              <Spinner />
              Pridávame obchod...
            </>
          ) : (
            <>
              <PlusIcon />
              Pridať nový obchod
            </>
          )}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
