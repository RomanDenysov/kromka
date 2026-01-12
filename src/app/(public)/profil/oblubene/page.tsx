import { HeartIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { GridView } from "@/components/views/grid-view";
import { getFavorites } from "@/features/favorites/queries";
import { ProductCard } from "@/features/products/components/product-card";
import { AddAllToCartButton } from "./add-all-to-cart-button";

export const metadata: Metadata = {
  title: "Obľúbené produkty",
  description: "Produkty, ktoré ste si uložili do obľúbených v Pekárni Kromka.",
  robots: { index: false, follow: false },
};

const PRELOAD_LIMIT = 15;

async function OblubenePageContent() {
  const favorites = await getFavorites();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-2xl">Obľúbené produkty</h1>
        <p className="text-muted-foreground">
          Produkty, ktoré ste si uložili do obľúbených
        </p>
      </div>

      {favorites.length === 0 ? (
        <Empty className="col-span-full mt-12 text-center md:mt-20">
          <HeartIcon className="mx-auto size-12 text-muted-foreground/50" />
          <EmptyTitle>Zatiaľ žiadne obľúbené produkty</EmptyTitle>
          <EmptyDescription>
            Pridajte produkty do obľúbených kliknutím na ikonu srdca.
          </EmptyDescription>
          <Link href="/e-shop">
            <Button className="mt-4" variant="default">
              Prejsť do e-shopu
            </Button>
          </Link>
        </Empty>
      ) : (
        <>
          <div className="flex justify-end">
            <AddAllToCartButton productIds={favorites.map((p) => p.id)} />
          </div>
          <GridView>
            {favorites.map((product, index) => (
              <ProductCard
                isFavorite={true}
                key={product.id}
                preload={index < PRELOAD_LIMIT}
                product={product}
              />
            ))}
          </GridView>
        </>
      )}
    </div>
  );
}

function OblubenePageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>
      <GridView>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            className="aspect-square rounded-md"
            key={`skeleton-${i.toString()}`}
          />
        ))}
      </GridView>
    </div>
  );
}

export default function OblubenePage() {
  return (
    <Suspense fallback={<OblubenePageSkeleton />}>
      <OblubenePageContent />
    </Suspense>
  );
}
