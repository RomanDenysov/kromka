import { type ReactNode, Suspense } from "react";
import { CartContextProvider } from "@/components/cart/cart-context";
import { Footer } from "@/components/landing/footer";
import { StoreSelectModal } from "@/components/modal/store-select-modal";
import { getCart } from "@/lib/queries/cart";
import { getStores } from "@/lib/queries/stores";
import { CustomerDataSync } from "@/store/customer-data-sync";
import { Header } from "./_components/header";

type Props = {
  readonly children: ReactNode;
};

function StoreSelectModalLoader() {
  const stores = getStores();
  return (
    <Suspense>
      <StoreSelectModal storesPromise={stores} />
    </Suspense>
  );
}

function CartContextProviderLoader({ children }: { children: ReactNode }) {
  const cartPromise = getCart();
  return (
    <Suspense>
      <CartContextProvider cartPromise={cartPromise}>
        {children}
      </CartContextProvider>
    </Suspense>
  );
}

export default function PublicLayout({ children }: Props) {
  return (
    <CartContextProviderLoader>
      <Suspense>
        <CustomerDataSync />
      </Suspense>
      <div className="relative flex h-full flex-col">
        <Header />
        <main className="relative min-h-screen flex-1 grow">{children}</main>
        <Footer />
      </div>
      <StoreSelectModalLoader />
    </CartContextProviderLoader>
  );
}
