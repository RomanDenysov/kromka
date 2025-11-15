"use client";

import { notFound } from "next/navigation";
import { StoreForm } from "@/components/forms/store-form";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { UsersTable } from "@/components/tables/users/users-table";
import { useGetStoreQuery } from "@/hooks/use-get-store-query";

export function StoreClientPage({ storeId }: { storeId: string }) {
  const { data: store, isLoading } = useGetStoreQuery(storeId);
  if (!store) {
    notFound();
  }
  return (
    <div>
      <div className="h-full max-w-md shrink-0 border-r p-4">
        {isLoading ? <FormSkeleton /> : <StoreForm store={store} />}
      </div>
      <UsersTable />
    </div>
  );
}
