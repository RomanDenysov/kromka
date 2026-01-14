"use client";

import { MagicLinkForm } from "@/app/prihlasenie/magic-link-form";
import { ProvidersForm } from "@/app/prihlasenie/providers-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type LoginReason,
  useLoginModalClose,
  useLoginModalState,
} from "@/store/login-modal-store";

const MESSAGES: Record<LoginReason, string> = {
  favorites: "Pre uloženie obľúbených produktov sa prihláste.",
  checkout: "Prihláste sa pre uloženie objednávky do účtu (voliteľné).",
  default: "Prihláste sa do svojho účtu.",
};

export function LoginModal() {
  const close = useLoginModalClose();
  const { isOpen, reason } = useLoginModalState();

  const message = MESSAGES[reason];

  return (
    <Dialog onOpenChange={(o) => !o && close()} open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center sm:text-center">
          <DialogTitle>Prihlásenie</DialogTitle>
          <DialogDescription className="text-base">{message}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ProvidersForm />

          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              alebo
            </span>
          </div>

          <MagicLinkForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
