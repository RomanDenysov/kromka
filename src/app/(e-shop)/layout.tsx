import type { ReactNode } from "react";
import { Header } from "../(public)/_components/header";

type Props = {
  readonly children: ReactNode;
};

export default function EShopMainLayout({ children }: Props) {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="min-h-screen flex-1 grow">{children}</main>
    </div>
  );
}
