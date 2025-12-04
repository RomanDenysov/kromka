import type { ReactNode } from "react";
import { Footer } from "@/components/landing/footer";
import { ModalProviders } from "@/components/modal/modal-providers";
import { Header } from "./_components/header";

type Props = {
  readonly children: ReactNode;
};

export default function PublicLayout({ children }: Props) {
  return (
    <>
      <div className="relative flex h-full flex-col">
        <Header />
        <main className="relative min-h-screen flex-1 grow">{children}</main>
        <Footer />
      </div>
      <ModalProviders />
    </>
  );
}
