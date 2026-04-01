import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductScrollRow } from "@/components/shared/product-scroll-row";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getHomepageProducts } from "@/features/products/api/queries";
import { ProductCardSkeleton } from "@/features/products/components/product-card";
import { cn } from "@/lib/utils";

export async function HomepageProducts() {
  const { topSellers } = await getHomepageProducts();

  if (topSellers.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold text-xl tracking-tight md:text-2xl">
          Najobľúbenejšie
        </h2>
        <Link
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-muted-foreground"
          )}
          href="/e-shop"
        >
          Zobraziť všetko
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <ProductScrollRow products={topSellers} />
    </section>
  );
}

export function HomepageProductsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-7 w-40" />
      <div className="flex gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            className="w-[42%] shrink-0 md:w-[22%] lg:w-[18%]"
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
            key={i}
          >
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
