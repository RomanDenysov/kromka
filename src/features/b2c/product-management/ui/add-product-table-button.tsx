"use client";

import { PackagePlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  loading?: boolean;
  onClick: () => void;
};

export const AddProductTableButton = ({ loading, onClick }: Props) => (
  <Button
    className="w-full rounded-none"
    disabled={loading}
    onClick={onClick}
    size="xs"
    type="button"
    variant="ghost"
  >
    {loading ? (
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
