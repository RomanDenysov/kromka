import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
      <body className={cn(fonts, "relative min-h-screen scroll-smooth")}>
        <Providers>
          <NuqsAdapter>
            {children}
            <Toaster richColors />
            <CookieBanner />
          </NuqsAdapter>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
