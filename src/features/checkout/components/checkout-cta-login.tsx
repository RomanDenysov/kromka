"use client";

import { LogInIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLoginModalOpen } from "@/store/login-modal-store";

export function CheckoutCtaLogin() {
  const openLogin = useLoginModalOpen();
  const pathname = usePathname();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border bg-accent p-2">
        <div className="min-w-0">
          <p className="font-medium text-xs">Máte účet?</p>
          <p className="text-muted-foreground text-xs">
            Prihláste sa pre uloženie objednávky do profilu.
          </p>
        </div>
        <Button
          className="w-full shrink-0 sm:w-auto"
          onClick={() => openLogin("checkout", pathname)}
          size="xs"
          type="button"
          variant="outline"
        >
          <LogInIcon className="mr-1 size-3.5" />
          Prihlásiť sa
        </Button>
      </div>
    </div>
  );
}
