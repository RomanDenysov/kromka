import { type ReactNode, Suspense } from "react";
import { Header } from "@/app/(public)/_components/header";
import { Footer } from "@/components/landing/footer";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

type Props = {
  readonly children: ReactNode;
};

export default async function PublicLayout({ children }: Props) {
  const queryClient = getQueryClient();

  await queryClient.fetchQuery(trpc.public.cart.getCart.queryOptions());

  return (
    <HydrateClient>
      <Suspense>
        <div className="flex h-full flex-col">
          <Header />
          <main className="min-h-screen flex-1 grow">{children}</main>
          <Footer />
        </div>
      </Suspense>
    </HydrateClient>
  );
}
