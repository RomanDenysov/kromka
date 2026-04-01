import type { ReactNode } from "react";
import { Suspense } from "react";
import { ReorderBarContent } from "@/features/buy-again-banner/components/reorder-bar-content";
import { Header } from "../_components/header";
import { HeaderActions } from "../_components/header-actions";

interface Props {
  readonly children: ReactNode;
}

export default function PagesLayout({ children }: Props) {
  return (
    <>
      <div className="sticky top-0 z-40">
        <Suspense>
          <ReorderBarContent />
        </Suspense>
        <Header>
          <HeaderActions />
        </Header>
      </div>
      <main className="min-h-svh">{children}</main>
    </>
  );
}
