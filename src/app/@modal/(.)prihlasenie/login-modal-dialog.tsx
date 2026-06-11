"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LoginModalDialogProps {
  readonly children: ReactNode;
}

export function LoginModalDialog({ children }: LoginModalDialogProps) {
  const router = useRouter();

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          router.back();
        }
      }}
      open
    >
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}
