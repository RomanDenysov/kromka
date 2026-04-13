import { type CSSProperties, type ReactNode, Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  getStoreBySlug,
  getStorePendingPickupsCount,
} from "@/features/store-manager/api/queries";
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
  const { storeSlug } = await params;
  const store = await getStoreBySlug(storeSlug);

  if (!store) {
    return <StoreSidebarSkeleton collapsible="icon" />;
  }

  const pickupCount = await getStorePendingPickupsCount(store.id);

  return (
    <StoreSidebar
      collapsible="icon"
      pickupCount={pickupCount}
      storeName={store.name}
      storeSlug={store.slug}
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
