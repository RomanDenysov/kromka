import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { getPriceTierById } from "@/features/b2b/price-tiers/api/queries";
import { getAdminProducts } from "@/features/products/api/queries";
import { PriceTierFormContainer } from "./form-container";

interface Props {
  params: Promise<{ id: string }>;
}

async function PriceTierLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const [tier, products] = await Promise.all([
    getPriceTierById(decodedId),
    getAdminProducts(),
  ]);

  if (!tier) {
    notFound();
  }

  return <PriceTierFormContainer products={products} tier={tier} />;
}

export default function PriceTierDetailPage({ params }: Props) {
  return (
    <section className="@container/page h-full flex-1 p-4">
      <Suspense
        fallback={
          <FormSkeleton className="w-full @md/page:max-w-md shrink-0 p-4" />
        }
      >
        <PriceTierLoader params={params} />
      </Suspense>
    </section>
  );
}
