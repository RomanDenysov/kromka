import type { ReactNode } from "react";
import { Header } from "@/app/(public)/_components/header";
import { Footer } from "@/components/landing/footer";

type Props = {
  readonly children: ReactNode;
};

export default function PublicLayout({ children }: Props) {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <Header />
      <main className="flex-1 grow">{children}</main>
      <Footer />
    </div>
  );
}
