"use client";

import { PackageOpenIcon, PlusIcon } from "lucide-react";
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
import { useCreateDraftProduct } from "@/hooks/mutations/use-create-draft-product";

export function EmptyState() {
  const { mutate: createDraftProduct, isPending } = useCreateDraftProduct();

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
          onClick={() => createDraftProduct()}
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
