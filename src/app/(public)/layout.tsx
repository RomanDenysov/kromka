import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Footer } from "@/components/landing/footer";
import { LoginModal } from "@/components/login-modal";
import { JsonLd } from "@/components/seo/json-ld";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import {
  CartBadge,
  CartBadgeSkeleton,
} from "@/features/cart/components/cart-badge";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { CartDrawerContent } from "@/features/cart/components/cart-drawer-content";
import {
  CartDrawerFooter,
  CartDrawerFooterLoader,
} from "@/features/cart/components/cart-drawer-footer";
import { preloadProducts } from "@/features/products/api/queries";
import { defaultMetadata } from "@/lib/metadata";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo/json-ld";
import { Header } from "./_components/header";

export const metadata: Metadata = {
  title: {
    default: "Pekáreň Kromka – Remeselná pekáreň",
    template: "%s | Pekáreň Kromka",
  },
  description:
    "Remeselná pekáreň na východnom Slovensku. Kváskový chlieb, pečivo a koláče z kvalitných surovín podľa tradičných receptov. Objednajte online, vyzdvihnite v predajni.",
  ...defaultMetadata,
};

interface Props {
  readonly children: ReactNode;
}

export default function PublicLayout({ children }: Props) {
  preloadProducts();

  return (
    <>
      <JsonLd data={[getOrganizationSchema(), getWebSiteSchema()]} />
      <Suspense
        fallback={<div className="h-12 w-full pt-[env(safe-area-inset-top)]" />}
      >
        <Header
          cartSlot={
            <CartDrawer
              indicator={
                <Suspense fallback={CartBadgeSkeleton}>
                  <CartBadge />
                </Suspense>
              }
            >
              <Suspense>
                <CartDrawerContent />
              </Suspense>
              <Suspense fallback={<CartDrawerFooterLoader />}>
                <CartDrawerFooter />
              </Suspense>
            </CartDrawer>
          }
        />
      </Suspense>
      <main className="size-full min-h-svh">{children}</main>
      <Footer />
      <LoginModal />
      <Suspense>
        <ScrollToTop />
      </Suspense>
    </>
  );
}
