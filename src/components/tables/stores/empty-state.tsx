"use client";

import { PlusIcon, StoreIcon } from "lucide-react";
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
import { createDraftStoreAction } from "@/lib/actions/stores";

export function EmptyState() {
  const [isPending, startTransition] = useTransition();

  const handleCreateDraftStore = () =>
    startTransition(async () => {
      await createDraftStoreAction();
    });

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
          onClick={handleCreateDraftStore}
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
