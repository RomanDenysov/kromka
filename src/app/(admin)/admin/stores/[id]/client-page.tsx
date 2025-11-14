"use client";

import { notFound } from "next/navigation";
import { StoreForm } from "@/components/forms/store-form";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { useGetStoreQuery } from "@/hooks/use-get-store-query";

export function StoreClientPage({ storeId }: { storeId: string }) {
  const { data: store, isLoading } = useGetStoreQuery(storeId);
  if (isLoading) {
    return <FormSkeleton />;
  }
  if (!store) {
    notFound();
  }
  return <StoreForm store={store} />;
}
