/**
 * Archived snapshot of the `/profil/oblubene` route — kept for reference when rebuilding favorites.
 * Not imported by the app; the live route redirects (see app route `profil/oblubene/page.tsx`).
 *
 * @deprecated Reference only.
 */
import { HeartIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { GridView } from "@/components/grid-view";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { getFavorites } from "@/features/favorites/api/queries";
import { AddAllToCartFavoritesButton } from "@/features/favorites/components/add-all-to-cart-favorites-button";
import { ProductCard } from "@/features/products/components/product-card";

const PRELOAD_LIMIT = 15;

/** @deprecated Reference — wire back when favorites return */
export async function ArchivedOblubenePageContent() {
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
            <AddAllToCartFavoritesButton
              productIds={favorites.map((p) => p.id)}
            />
          </div>
          <GridView>
            {favorites.map((product, index) => (
              <ProductCard
                key={product.id}
                preload={index < PRELOAD_LIMIT}
                product={product}
                source="favorites"
              />
            ))}
          </GridView>
        </>
      )}
    </div>
  );
}

function ArchivedOblubenePageSkeleton() {
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

/** @deprecated Reference — replace redirect in page.tsx when restoring favorites */
export default function ArchivedOblubenePage() {
  return (
    <Suspense fallback={<ArchivedOblubenePageSkeleton />}>
      <ArchivedOblubenePageContent />
    </Suspense>
  );
}
