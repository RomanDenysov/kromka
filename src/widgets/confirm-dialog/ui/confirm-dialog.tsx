"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ConfirmOptions } from "../types";

export function ConfirmDialog({
  open,
  onOpenChange,
  options,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: ConfirmOptions;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const {
    title = "Podtvrdit",
    description = "Opravdu chcete pokračovat?",
    cancelText = "Zrušit",
    confirmText = "Potvrdit",
    variant = "default",
  } = options;

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader className="sm:text-center">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel className="flex-1" onClick={onCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant }), "flex-1")}
            onClick={onConfirm}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
