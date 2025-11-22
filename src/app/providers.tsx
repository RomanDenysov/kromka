"use client";

import { type ReactNode, Suspense } from "react";
import { PageTracker } from "react-page-tracker";
import { ThemeProvider } from "@/components/theme-provider";
import { AnonymousProvider } from "@/lib/auth/anonymous-provider";
import { TRPCReactProvider } from "@/trpc/client";

type Props = {
  readonly children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <TRPCReactProvider>
      <PageTracker enableStrictModeHandler={false} />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        enableSystem
      >
        {children}
      </ThemeProvider>
      <Suspense>
        <AnonymousProvider />
      </Suspense>
    </TRPCReactProvider>
  );
}
