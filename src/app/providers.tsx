"use client";

import type { ReactNode } from "react";
import { PostHogProvider } from "@/components/posthog-provider";
import { ThemeProvider } from "@/components/theme-provider";

type Props = {
  readonly children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <PostHogProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        enableSystem
      >
        {children}
      </ThemeProvider>
    </PostHogProvider>
  );
}
