"use client";

import { PackageOpenIcon, PlusIcon } from "lucide-react";
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
import { createDraftProductAction } from "@/lib/actions/products";

export function EmptyState() {
  const [isPending, startTransition] = useTransition();

  const handleCreateDraftProduct = () =>
    startTransition(async () => {
      await createDraftProductAction();
    });

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PackageOpenIcon />
        </EmptyMedia>
        <EmptyTitle>Žiadne výsledky.</EmptyTitle>
        <EmptyDescription>
          Vytvorte nový produkt pre vašu predajňu.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          disabled={isPending}
          onClick={handleCreateDraftProduct}
          size="sm"
          variant="outline"
        >
          {isPending ? (
            <>
              <Spinner />
              Pridávame produkt...
            </>
          ) : (
            <>
              <PlusIcon />
              Pridať nový produkt
            </>
          )}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
