"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, Suspense } from "react";
import { PageTracker } from "react-page-tracker";
import { AnonymousProvider } from "@/lib/auth/anonymous-provider";
import { TRPCReactProvider } from "@/trpc/client";
import { ConfirmDialogProvider } from "@/widgets/confirm-dialog/ui/confirm-provider";
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
          <Suspense>
            <AnonymousProvider />
          </Suspense>
        </ConfirmDialogProvider>
        <Toaster richColors />
      </NuqsAdapter>
    </TRPCReactProvider>
  );
}
