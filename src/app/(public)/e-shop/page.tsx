import { Suspense } from "react";
import { ProductsGrid } from "@/components/products-grid";

export default function EshopPage({ searchParams }: PageProps<"/e-shop">) {
  return (
    <Suspense>
      <ProductsGrid searchParams={searchParams} />
    </Suspense>
  );
}
