import { Activity, type ReactNode, Suspense } from "react";
import { Footer } from "@/components/landing/footer";
import { StoreSelectModal } from "@/components/modal/store-select-modal";
import { getStores } from "@/lib/queries/stores";
import { CustomerDataSync } from "@/store/customer-data-sync";
import { Header } from "./_components/header";

type Props = {
  readonly children: ReactNode;
};

export default async function PublicLayout({ children }: Props) {
  const stores = await getStores();
  return (
    <>
      <Suspense>
        <CustomerDataSync />
      </Suspense>
      <div className="relative flex h-full flex-col">
        <Header />
        <main className="relative min-h-screen flex-1 grow">{children}</main>
        <Footer />
      </div>
      <Activity mode={stores.length > 1 ? "visible" : "hidden"}>
        <StoreSelectModal stores={stores} />
      </Activity>
    </>
  );
}
