"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { PageTracker } from "react-page-tracker";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "./ui/sonner";

type Props = {
  readonly children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <TRPCReactProvider>
      <NuqsAdapter>
        <PageTracker enableStrictModeHandler={false} />
        {children}
        <Toaster richColors />
      </NuqsAdapter>
    </TRPCReactProvider>
  );
}
