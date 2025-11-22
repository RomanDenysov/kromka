import type { ReactNode } from "react";
import { Header } from "@/app/(public)/_components/header";
import { Footer } from "@/components/landing/footer";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

type Props = {
  readonly children: ReactNode;
};

export default function PublicLayout({ children }: Props) {
  batchPrefetch([
    trpc.public.cart.getCart.queryOptions(),
    trpc.public.users.me.queryOptions(),
  ]);

  return (
    <HydrateClient>
      <div className="flex h-full flex-col">
        <Header />
        <main className="min-h-screen flex-1 grow">{children}</main>
        <Footer />
      </div>
    </HydrateClient>
  );
}
