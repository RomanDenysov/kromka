import type { ReactNode } from "react";
import { Header } from "../_components/header";
import { HeaderActions } from "../_components/header-actions";

interface Props {
  readonly children: ReactNode;
}

export default function PagesLayout({ children }: Props) {
  return (
    <>
      <div className="sticky top-0 z-40">
        <Header>
          <HeaderActions />
        </Header>
      </div>
      <main className="min-h-svh">{children}</main>
    </>
  );
}
