"use client";

import { ExternalLinkIcon, UnlinkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { formatCentsAsEur } from "@/features/ingredients/lib/price-conversion";
import { createRecipeAction, linkProductRecipeAction } from "../api/actions";

interface LinkedRecipeSummary {
  costPerUnitCents: number | null;
  id: string;
  name: string;
  /** When the resolver throws, surface a Slovak error message. */
  resolverError: string | null;
  status: "draft" | "published";
}

interface UnlinkedRecipeOption {
  id: string;
  name: string;
}

interface Props {
  availableProductRecipes: UnlinkedRecipeOption[];
  linkedRecipe: LinkedRecipeSummary | null;
  productId: string;
}

/**
 * Compact "Recept" card on the product detail page. Three states:
 * - No recipe → Vytvoriť / Prepojiť existujúci
 * - Linked → name, summary, Otvoriť ↗, Odpojiť
 * - Orphaned recipe with resolver error → warning + Odpojiť
 *
 * Full Recept tab integration with a tab strip is a follow-up; this
 * card lives inline alongside the existing form.
 */
export function ProductRecipeCard({
  productId,
  linkedRecipe,
  availableProductRecipes,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedExistingId, setSelectedExistingId] = useState<string | null>(
    null
  );

  const handleCreate = () => {
    startTransition(async () => {
      // createRecipeAction throws a redirect sentinel on success — let it bubble.
      await createRecipeAction({ kind: "product", productId });
    });
  };

  const handleLinkExisting = () => {
    if (!selectedExistingId) {
      toast.error("Vyberte recept");
      return;
    }
    const id = selectedExistingId;
    startTransition(async () => {
      const res = await linkProductRecipeAction({
        productId,
        recipeId: id,
      });
      if (res.success) {
        toast.success("Recept priradený");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleUnlink = () => {
    startTransition(async () => {
      const res = await linkProductRecipeAction({
        productId,
        recipeId: null,
      });
      if (res.success) {
        toast.success("Recept odpojený");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  if (!linkedRecipe) {
    return (
      <aside className="space-y-3 rounded-lg border bg-card p-4">
        <div>
          <h3 className="font-semibold text-sm">Recept</h3>
          <p className="text-muted-foreground text-xs">
            Pripojte recept aby sa vypočítala produkčná cena a (Phase D) sa
            odvodili nutričné hodnoty.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button disabled={pending} onClick={handleCreate} size="sm">
            {pending && <Spinner />}
            Vytvoriť recept
          </Button>
          {availableProductRecipes.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-xs">
                Alebo prepojiť existujúci:
              </p>
              <div className="flex items-center gap-2">
                <Select
                  onValueChange={setSelectedExistingId}
                  value={selectedExistingId ?? undefined}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Vybrať recept..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProductRecipes.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={pending || !selectedExistingId}
                  onClick={handleLinkExisting}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Prepojiť
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-sm">Recept</h3>
        <span className="text-muted-foreground text-xs">
          {linkedRecipe.status === "published" ? "Publikovaný" : "Koncept"}
        </span>
      </div>

      <Link
        className="block font-medium hover:underline"
        href={`/admin/production/recipes/${linkedRecipe.id}`}
      >
        {linkedRecipe.name}
      </Link>

      {linkedRecipe.resolverError ? (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-destructive text-xs">
          {linkedRecipe.resolverError}
        </p>
      ) : (
        <div>
          <p className="text-muted-foreground text-xs">Cena za kus</p>
          <p className="font-semibold text-xl tabular-nums">
            {linkedRecipe.costPerUnitCents === null
              ? "—"
              : formatCentsAsEur(linkedRecipe.costPerUnitCents)}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/production/recipes/${linkedRecipe.id}`}>
            <ExternalLinkIcon className="mr-1 size-3.5" />
            Otvoriť
          </Link>
        </Button>
        <Button
          disabled={pending}
          onClick={handleUnlink}
          size="sm"
          type="button"
          variant="ghost"
        >
          <UnlinkIcon className="mr-1 size-3.5" />
          Odpojiť
        </Button>
      </div>
    </aside>
  );
}
