import { PackageIcon, SquareArrowOutUpRightIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminStore } from "@/features/stores/api/queries";
import { StoreStatusSwitch } from "@/features/stores/components/store-status-switch";
import { cn } from "@/lib/utils";

function StoreCard({ store }: { store: AdminStore }) {
  return (
    <div className="group flex shrink flex-col justify-between gap-2 rounded-md border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-sm">{store.name}</h3>
        <StoreStatusSwitch store={store} />
      </div>
      <div className="min-h-4 flex-1" />
      <div className="flex items-start justify-between">
        <Badge size="xs" variant="outline">
          <PackageIcon className="size-3.5" />
          {store.orders.length} obj
        </Badge>
      </div>
      <Link
        className={cn(
          buttonVariants({ variant: "ghost", size: "xs" }),
          "ml-auto w-fit"
        )}
        href={`/admin/eshop/stores/${store.id}`}
      >
        Otvoriť
        <SquareArrowOutUpRightIcon className="ml-1 size-3.5" />
      </Link>
    </div>
  );
}

export function StoresGrid({ stores }: { stores: AdminStore[] }) {
  const sortedStores = [...stores].toSorted(
    (a, b) => Number(b.isActive) - Number(a.isActive)
  );

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4 p-3">
      {sortedStores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
}

export function StoresGridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4 p-3">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
  );
}
