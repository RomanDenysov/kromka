"use client";

import { TrashIcon } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { ComboboxInput } from "@/components/shared/combobox-input";
import { Button } from "@/components/ui/button";
import {
  addPrelinkAction,
  removePrelinkAction,
} from "@/features/product-prelinks/api/actions";
import { formatPrice } from "@/lib/utils";

interface PickerProduct {
  id: string;
  imageUrl: string | null;
  isActive: boolean;
  name: string;
  priceCents: number;
  status: string;
}

export interface ExistingPrelink {
  imageUrl: string | null;
  isActive: boolean;
  linkedProductId: string;
  name: string;
  priceCents: number;
  status: string;
}

interface Props {
  availableProducts: PickerProduct[];
  initialPrelinks: ExistingPrelink[];
  productId: string;
}

const ACTION_ERRORS: Record<string, string> = {
  INVALID_DATA: "Neplatné údaje.",
  SELF_LINK: "Nemôžete prepojiť produkt sám so sebou.",
  NOT_FOUND: "Produkt nebol nájdený.",
  INSERT_FAILED: "Pridanie zlyhalo. Skúste to znova.",
};

export function ProductPrelinksSection({
  productId,
  initialPrelinks,
  availableProducts,
}: Props) {
  const [prelinks, setPrelinks] = useState<ExistingPrelink[]>(initialPrelinks);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pickerOptions = useMemo(() => {
    const linkedIds = new Set(prelinks.map((p) => p.linkedProductId));
    return availableProducts
      .filter(
        (p) =>
          p.id !== productId &&
          !linkedIds.has(p.id) &&
          p.isActive &&
          p.status !== "draft" &&
          p.status !== "archived"
      )
      .map((p) => ({ value: p.id, label: p.name }));
  }, [availableProducts, prelinks, productId]);

  const handleAdd = () => {
    if (!selectedId) {
      return;
    }
    const target = availableProducts.find((p) => p.id === selectedId);
    if (!target) {
      return;
    }
    startTransition(async () => {
      const result = await addPrelinkAction({
        productId,
        linkedProductId: selectedId,
      });
      if (!result.success) {
        toast.error(ACTION_ERRORS[result.error] ?? "Pridanie zlyhalo.");
        return;
      }
      setPrelinks((prev) => [
        ...prev,
        {
          linkedProductId: target.id,
          name: target.name,
          priceCents: target.priceCents,
          imageUrl: target.imageUrl,
          status: target.status,
          isActive: target.isActive,
        },
      ]);
      setSelectedId(null);
      toast.success("Prepojenie pridané");
    });
  };

  const handleRemove = (linkedProductId: string) => {
    startTransition(async () => {
      const result = await removePrelinkAction({
        productId,
        linkedProductId,
      });
      if (!result.success) {
        toast.error(ACTION_ERRORS[result.error] ?? "Odstránenie zlyhalo.");
        return;
      }
      setPrelinks((prev) =>
        prev.filter((p) => p.linkedProductId !== linkedProductId)
      );
      toast.success("Prepojenie odstránené");
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <header>
        <h2 className="font-semibold text-base">Súvisiace produkty</h2>
        <p className="text-muted-foreground text-sm">
          Odporúčaný produkt zobrazený na detaile pod popisom (napríklad balenie
          6 ks pre večeru pre viacerých). Zákazník ho pridá do košíka
          samostatne.
        </p>
      </header>

      <div className="grid @md/page:grid-cols-[1fr_auto] items-end gap-3">
        <div className="flex flex-col gap-1">
          <label
            className="font-medium text-sm"
            htmlFor="prelink-product-picker"
          >
            Pridať prepojenie
          </label>
          <ComboboxInput
            onChange={(v) => setSelectedId(v)}
            options={pickerOptions}
            value={selectedId}
          />
        </div>
        <Button
          disabled={!selectedId || isPending}
          onClick={handleAdd}
          size="sm"
          type="button"
        >
          Pridať
        </Button>
      </div>

      {prelinks.length === 0 ? (
        <p className="rounded-md border border-dashed bg-muted/30 px-4 py-6 text-center text-muted-foreground text-sm">
          Žiadne prepojené produkty.
        </p>
      ) : (
        <ul className="flex flex-col divide-y rounded-md border">
          {prelinks.map((link) => (
            <li
              className="flex items-center gap-3 px-3 py-2"
              key={link.linkedProductId}
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                {link.imageUrl ? (
                  <Image
                    alt={link.name}
                    className="object-cover"
                    fill
                    sizes="48px"
                    src={link.imageUrl}
                  />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium text-sm">
                  {link.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {formatPrice(link.priceCents)}
                </span>
              </div>
              <Button
                aria-label={`Odstrániť ${link.name}`}
                disabled={isPending}
                onClick={() => handleRemove(link.linkedProductId)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <TrashIcon className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
