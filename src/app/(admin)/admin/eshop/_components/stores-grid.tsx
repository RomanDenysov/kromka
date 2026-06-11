import { PackageIcon, SquareArrowOutUpRightIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type AdminStore, getAdminStores } from "@/features/stores/api/queries";
import { cn } from "@/lib/utils";

function StoreCard({ store }: { store: AdminStore }) {
  return (
    <div
      className="group flex shrink flex-col justify-between gap-1 rounded-md border bg-card p-4 shadow-sm"
      key={store.id}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-sm">{store.name}</h3>
        {store.isActive ? (
          <Badge size="xs" variant="default">
            <span className="size-2 animate-pulse rounded-full bg-green-500" />
            Aktívny
          </Badge>
        ) : (
          <Badge size="xs" variant="secondary">
            <span className="size-2 animate-pulse rounded-full bg-red-500" />
            Neaktívny
          </Badge>
        )}
      </div>
      <div className="min-h-4 flex-1" />
      <Badge size="xs" variant="outline">
        <PackageIcon className="size-3.5" />1 obj
      </Badge>
      <Link
        className={cn(
          buttonVariants({ variant: "ghost", size: "xs" }),
          "ml-auto w-fit"
        )}
        href={`/admin/eshop/stores/${store.id}`}
      >
        Upraviť
        <SquareArrowOutUpRightIcon className="size-3.5" />
      </Link>
    </div>
  );
}

export async function StoresGrid() {
  const stores = await getAdminStores();

  const sortedStores = [...stores].toSorted(
    (a, b) => Number(b.isActive) - Number(a.isActive)
  );

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
      {sortedStores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
}

export function StoresGridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
  );
}
