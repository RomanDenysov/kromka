import { StoreIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { STORE_MANAGER_BASE_PATH } from "@/features/store-manager/paths";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Predajna nenajdena</EmptyTitle>
          <EmptyDescription>
            Predajna, ktoru hladate, neexistuje alebo bola deaktivovana.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <StoreIcon className="h-12 w-12 text-muted-foreground" />
          <Button asChild>
            <Link href={STORE_MANAGER_BASE_PATH as Route}>
              Vybrat inu predajnu
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
