import { StoreIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getManagerStores } from "@/features/store-manager/api/queries";
import { STORE_MANAGER_BASE_PATH } from "@/features/store-manager/paths";
import { requireStaff } from "@/lib/auth/guards";

async function StorePickerContent() {
  const staff = await requireStaff();
  const stores = await getManagerStores(staff);

  if (stores.length === 0) {
    return (
      <div className="text-center">
        <StoreIcon className="mx-auto mb-4 size-12 text-muted-foreground" />
        <h1 className="font-semibold text-xl">Ziadne predajne</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Nie ste priradeny k ziadnej predajni.
        </p>
      </div>
    );
  }

  const onlyStore = stores[0];
  if (stores.length === 1 && onlyStore) {
    redirect(`${STORE_MANAGER_BASE_PATH}/${onlyStore.slug}` as Route);
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="font-semibold text-2xl">Vyberte predajnu</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Spravujete viacero predajni. Vyberte, ktoru chcete otvorit.
        </p>
      </div>
      <div className="space-y-2">
        {stores.map((store) => (
          <Link
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            href={`${STORE_MANAGER_BASE_PATH}/${store.slug}` as Route}
            key={store.id}
          >
            <StoreIcon className="size-5 text-muted-foreground" />
            <span className="font-medium">{store.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function StorePickerPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Suspense fallback={<Skeleton className="h-64 w-full max-w-md" />}>
        <StorePickerContent />
      </Suspense>
    </div>
  );
}
