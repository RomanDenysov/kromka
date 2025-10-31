import type { ReactNode } from "react";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";

type Props = {
  readonly children: ReactNode;
};

export default function PublicLayout({ children }: Props) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
