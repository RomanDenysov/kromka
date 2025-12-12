import { Analytics } from "@vercel/analytics/next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { Providers } from "@/app/providers";
import { CookieBanner } from "@/components/cookie-banner";
import { fonts } from "@/components/fonts";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

import "./globals.css";

type Props = {
  readonly children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="sk" suppressHydrationWarning>
      <body className={cn(fonts, "min-h-svh scroll-smooth")}>
        <Providers>
          <NuqsAdapter>
            {children}
            <Toaster richColors />
            <CookieBanner />
          </NuqsAdapter>
        </Providers>
        <Analytics />
        {/* TODO: add speed insights back when we have a better way to measure performance */}
        {/* <SpeedInsights /> */}
      </body>
    </html>
  );
}
