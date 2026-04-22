import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getCategoriesLink } from "@/app/(public)/(pages)/e-shop/eshop-params";
import { ProductScrollRow } from "@/components/shared/product-scroll-row";
import { buttonVariants } from "@/components/ui/button";
import { HOMEPAGE_PECIVO_CATEGORY_SLUG } from "@/config/homepage";
import { getProductsByCategory } from "@/features/products/api/queries";
import { cn } from "@/lib/utils";

const DISPLAY_LIMIT = 8;

export async function HomepagePecivoProducts() {
  const products = await getProductsByCategory(HOMEPAGE_PECIVO_CATEGORY_SLUG);

  if (!products || products.length === 0) {
    return null;
  }

  const displayed = products.slice(0, DISPLAY_LIMIT);
  const heading = products[0]?.category?.name ?? "Naše pečivo";

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold text-xl tracking-tight md:text-2xl">
          {heading}
        </h2>
        <Link
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-muted-foreground"
          )}
          href={getCategoriesLink({ category: HOMEPAGE_PECIVO_CATEGORY_SLUG })}
        >
          Zobraziť všetko
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <ProductScrollRow products={displayed} />
    </section>
  );
}
