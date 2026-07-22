import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import { Suspense } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import {
  getManagerStores,
  getStoreBySlug,
  getStorePendingPickupsCount,
} from "@/features/store-manager/api/queries";
import { requireStaff } from "@/lib/auth/guards";
import { StoreSidebarNav } from "@/widgets/store-manager-sidebar/store-sidebar-nav";
import {
  StoreSelector,
  type StoreSelectorStore,
} from "@/widgets/store-manager-sidebar/store-sidebar-selector";

const STORE_TYPE_LABEL = "Vlastna predajna";
const DAILY_SKELETON_KEYS = ["daily-1", "daily-2", "daily-3"] as const;
const MANAGEMENT_SKELETON_KEYS = [
  "mgmt-1",
  "mgmt-2",
  "mgmt-3",
  "mgmt-4",
] as const;

type StoreSidebarProps = ComponentProps<typeof Sidebar> & {
  params: Promise<{ storeSlug: string }>;
};

/**
 * Store manager sidebar shell.
 *
 * Composed of isolated async server loaders, each in its own Suspense
 * boundary, that feed serializable props to client presentational pieces.
 * The shell paints from cache instantly and only the truly store-specific
 * bits (current store header, pickup-count badge) stream in. The store
 * picker list is user-scoped and `"use cache"`-d, so it does not refetch on
 * store changes.
 */
export default function StoreSidebar({
  params,
  ...sidebarProps
}: StoreSidebarProps) {
  return (
    <Sidebar {...sidebarProps}>
      <Suspense fallback={<StoreSidebarHeaderSkeleton />}>
        <StoreSidebarSelectorLoader params={params} />
      </Suspense>

      <SidebarContent>
        <Suspense fallback={<StoreSidebarNavSkeleton />}>
          <StoreSidebarNavLoader params={params} />
        </Suspense>

        <StoreSidebarFooter />
      </SidebarContent>
    </Sidebar>
  );
}

async function StoreSidebarSelectorLoader({
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

  return (
    <StoreSelector
      storeName={store.name}
      storeSlug={store.slug}
      stores={managerStores as readonly StoreSelectorStore[]}
      storeType={STORE_TYPE_LABEL}
    />
  );
}

async function StoreSidebarNavLoader({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const [staff, { storeSlug }] = await Promise.all([requireStaff(), params]);
  const store = await getStoreBySlug(staff, storeSlug);

  // Selector loader already calls notFound() for a missing store; render
  // nothing here to avoid a double 404 and skip fetching the pickup count.
  if (!store) {
    return null;
  }

  const pickupCount = await getStorePendingPickupsCount(store.id);

  return <StoreSidebarNav pickupCount={pickupCount} storeSlug={store.slug} />;
}

function StoreSidebarFooter() {
  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" target="_blank" />}
              tooltip="Zobrazit e-shop"
            >
              <ExternalLinkIcon />
              <span>Zobrazit e-shop</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function StoreSidebarHeaderSkeleton() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

function StoreSidebarNavSkeleton() {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {DAILY_SKELETON_KEYS.map((key) => (
              <SidebarMenuItem key={key}>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {MANAGEMENT_SKELETON_KEYS.map((key) => (
              <SidebarMenuItem key={key}>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

export function StoreSidebarSkeleton(props: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <StoreSidebarHeaderSkeleton />
      <SidebarContent>
        <StoreSidebarNavSkeleton />
      </SidebarContent>
    </Sidebar>
  );
}
