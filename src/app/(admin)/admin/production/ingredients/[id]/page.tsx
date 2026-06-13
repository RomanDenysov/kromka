import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { getAllergens } from "@/features/allergens/api/queries";
import {
  getIngredientById,
  getIngredientPriceHistory,
} from "@/features/ingredients/api/queries";
import { IngredientForm } from "@/features/ingredients/components/ingredient-form";
import { PriceHistoryPanel } from "@/features/ingredients/components/price-history-panel";
import { AdminHeader } from "@/widgets/admin-header/admin-header";

interface Props {
  params: Promise<{ id: string }>;
}

async function IngredientDetailLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const [ingredient, allergens, priceHistory] = await Promise.all([
    getIngredientById(decodedId),
    getAllergens(),
    getIngredientPriceHistory(decodedId, 20),
  ]);

  if (!ingredient) {
    notFound();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <IngredientForm
        allergens={allergens}
        initial={ingredient}
        variant="page"
      />
      <PriceHistoryPanel
        baseUnit={ingredient.baseUnit}
        history={priceHistory}
      />
    </div>
  );
}

export default function IngredientDetailPage({ params }: Props) {
  // Middleware guards /admin/*; server actions guard mutations.
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Výroba", href: "/admin/production" },
          { label: "Suroviny", href: "/admin/production/ingredients" },
          { label: "Detail" },
        ]}
      />
      <section className="@container/page p-4">
        <Suspense fallback={<FormSkeleton />}>
          <IngredientDetailLoader params={params} />
        </Suspense>
      </section>
    </>
  );
}
