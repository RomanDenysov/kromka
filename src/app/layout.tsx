import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/app/providers";
import { fonts } from "@/components/fonts";
import { cn } from "@/lib/utils";

import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Pekáreň Kromka – Remeselná pekáreň",
    template: "%s | Pekáreň Kromka",
  },
  description:
    "Pripravte sa na Vianoce s Pekárňou Kromka. Voňavá kváskova vianočka, makový a orechový závin a čerstvý chlieb na sviatočný stôl. Remeselná kvalita s láskou.",
};

type Props = {
  readonly children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(fonts, "relative h-full min-h-screen scroll-smooth")}>
        <Providers>
          <NuqsAdapter>
            {children}
            <Toaster richColors />
          </NuqsAdapter>
        </Providers>
      </body>
    </html>
  );
}
