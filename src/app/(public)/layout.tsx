import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/landing/footer";
import { defaultMetadata } from "@/lib/metadata";
import { Header } from "./_components/header";

export const metadata: Metadata = {
  title: {
    default: "Pekáreň Kromka – Remeselná pekáreň",
    template: "%s | Pekáreň Kromka",
  },
  description:
    "Pripravte sa na Vianoce s Pekárňou Kromka. Voňavá kváskova vianočka, makový a orechový závin a čerstvý chlieb na sviatočný stôl. Remeselná kvalita s láskou.",
  ...defaultMetadata,
};

type Props = {
  readonly children: ReactNode;
};

export default function PublicLayout({ children }: Props) {
  return (
    <div className="relative flex min-h-full flex-col">
      <Header />
      <main className="relative min-h-screen flex-1 grow">{children}</main>
      <Footer />
    </div>
  );
}
