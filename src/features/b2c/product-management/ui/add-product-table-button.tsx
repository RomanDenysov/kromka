"use client";

import { PackagePlusIcon } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCreateDraftProduct } from "../hooks/use-product-mutations";

export function AddProductTableButton({ loading }: { loading?: boolean }) {
  const { mutate: createDraftProduct, isPending: isCreatingDraftProduct } =
    useCreateDraftProduct();

  const handleCreateDraftProduct = useCallback(() => {
    createDraftProduct();
  }, [createDraftProduct]);

  return (
    <Button
      className="w-full rounded-none"
      disabled={isCreatingDraftProduct || loading}
      onClick={handleCreateDraftProduct}
      size="xs"
      type="button"
      variant="ghost"
    >
      {isCreatingDraftProduct ? (
        <>
          <Spinner />
          Pridávanie produktu...
        </>
      ) : (
        <>
          <PackagePlusIcon />
          Pridať produkt
        </>
      )}
    </Button>
  );
}
