import { Suspense } from "react";
import { MagicLinkForm } from "@/app/prihlasenie/magic-link-form";
import { ProvidersForm } from "@/app/prihlasenie/providers-form";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginModalDialog } from "./login-modal-dialog";

export default function LoginModalPage() {
  return (
    <LoginModalDialog>
      <DialogHeader>
        <DialogTitle className="text-center">Prihlásenie</DialogTitle>
        <DialogDescription className="text-center">
          Prihláste sa do svojho účtu Pekárne Kromka.
          <br />
          Sledujte objednávky, uložte obľúbené produkty a nakupujte rýchlejšie.
        </DialogDescription>
      </DialogHeader>
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <ProvidersForm />
      </Suspense>
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          alebo
        </span>
      </div>
      <Suspense fallback={<Skeleton className="h-12 w-full" />}>
        <MagicLinkForm />
      </Suspense>
    </LoginModalDialog>
  );
}
