"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { PageTracker } from "react-page-tracker";
import { TRPCReactProvider } from "@/trpc/client";
import { ConfirmDialogProvider } from "@/widgets/confirm-dialog/ui/confirm-provider";
import { DrawerProvider } from "./drawers/drawer-provider";
import { Toaster } from "./ui/sonner";

type Props = {
  readonly children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <TRPCReactProvider>
      <NuqsAdapter>
        <PageTracker enableStrictModeHandler={false} />
        <ConfirmDialogProvider>
          {children}
          <DrawerProvider />
        </ConfirmDialogProvider>
        <Toaster richColors />
      </NuqsAdapter>
    </TRPCReactProvider>
  );
}
