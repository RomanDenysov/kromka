import type { ReactNode } from "react";
import { Header } from "../_components/header";
import { HeaderActions } from "../_components/header-actions";

interface Props {
  readonly children: ReactNode;
}

export default function PagesLayout({ children }: Props) {
  return (
    <>
      <Header>
        <HeaderActions />
      </Header>
      <main className="min-h-svh">{children}</main>
    </>
  );
}
