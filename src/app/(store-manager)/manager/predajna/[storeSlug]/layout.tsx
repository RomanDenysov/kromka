import { notFound } from "next/navigation";
import { type CSSProperties, type ReactNode, Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  getManagerStores,
  getStoreBySlug,
  getStorePendingPickupsCount,
} from "@/features/store-manager/api/queries";
import { requireStaff } from "@/lib/auth/guards";
import StoreSidebar, {
  StoreSidebarSkeleton,
} from "@/widgets/store-manager-sidebar/store-sidebar";

interface Props {
  readonly children: ReactNode;
  params: Promise<{ storeSlug: string }>;
}

async function StoreManagerSidebarLoader({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const [staff, { storeSlug }] = await Promise.all([requireStaff(), params]);
  const [store, managerStores] = await Promise.all([
    getStoreBySlug(staff, storeSlug),
    getManagerStores(staff),
  ]);

  if (!store) {
    notFound();
  }

  const pickupCount = await getStorePendingPickupsCount(store.id);

  return (
    <StoreSidebar
      collapsible="icon"
      pickupCount={pickupCount}
      storeName={store.name}
      storeSlug={store.slug}
      stores={managerStores}
      storeType="Vlastna predajna"
      tomorrowOrderAlert={false}
    />
  );
}

export default function StoreLayout({ children, params }: Props) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <Suspense fallback={<StoreSidebarSkeleton collapsible="icon" />}>
        <StoreManagerSidebarLoader params={params} />
      </Suspense>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
