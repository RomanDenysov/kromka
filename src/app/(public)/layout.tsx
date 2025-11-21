import type { ReactNode } from "react";
import { Header } from "@/app/(public)/_components/header";
import { Footer } from "@/components/landing/footer";
import { AnonymousProvider } from "@/lib/auth/anonymous-provider";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

type Props = {
  readonly children: ReactNode;
};

export default function PublicLayout({ children }: Props) {
  prefetch(trpc.public.users.me.queryOptions());

  return (
    <>
      <HydrateClient>
        <div className="flex h-full flex-col">
          <Header />
          <main className="min-h-screen flex-1 grow">{children}</main>
          <Footer />
        </div>
      </HydrateClient>
      <AnonymousProvider />
    </>
  );
}
