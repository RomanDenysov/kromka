import type { ReactNode } from "react";
import { Footer } from "@/components/landing/footer";
import {
  batchPrefetch,
  getQueryClient,
  HydrateClient,
  trpc,
} from "@/trpc/server";

type Props = {
  readonly children: ReactNode;
};

export default async function PublicLayout({ children }: Props) {
  const queryClient = getQueryClient();
  batchPrefetch([
    trpc.public.products.list.queryOptions(),
    trpc.public.categories.list.queryOptions(),
    trpc.public.stores.list.queryOptions(),
    trpc.public.stores.getUserStore.queryOptions(),
  ]);

  const user = await queryClient.fetchQuery(
    trpc.public.users.me.queryOptions()
  );
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log(user);

  return (
    <HydrateClient>
      <div className="flex h-full flex-col">
        {/* <Header /> */}
        <main className="min-h-screen flex-1 grow">{children}</main>
        <Footer />
      </div>
    </HydrateClient>
  );
}
