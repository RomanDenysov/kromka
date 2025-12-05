"use client";

import type { ReactNode } from "react";
import { PageTracker } from "react-page-tracker";
import { ReactQueryProvider } from "@/components/react-query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { AnonymousProvider } from "@/lib/auth/anonymous-provider";

type Props = {
  readonly children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <ReactQueryProvider>
      <PageTracker enableStrictModeHandler={false} />
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        enableSystem
      >
        {children}
      </ThemeProvider>
      <AnonymousProvider />
    </ReactQueryProvider>
  );
}
