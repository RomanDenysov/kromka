import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  TagsIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { ImageSlider } from "@/components/image-slider";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { Hint } from "@/components/shared/hint";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getProducts } from "@/lib/queries/products";
import { cn, formatPrice } from "@/lib/utils";
import { AddWithQuantityButton } from "./add-with-quantity-button";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const allProducts = await getProducts();
  return allProducts.map((p) => ({ slug: p.slug }));
}

async function ProductPageContent({ params }: Props) {
  const { slug } = await params;
  const urlDecoded = decodeURIComponent(slug);
  const products = await getProducts();
  const result = products.find((p) => p.slug === urlDecoded) ?? null;

  if (!result) {
    notFound();
  }
  const validUrls = result.images;
  const isInStock = result.status === "active";
  const pickupDates = result.category?.pickupDates;
  const hasPickupRestriction = pickupDates && pickupDates.length > 0;

  const descriptionHtml = generateHTML(
    result?.description ?? {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }],
    },
    [StarterKit]
  );

  return (
    <PageWrapper>
      <AppBreadcrumbs
        items={[{ label: "E-shop", href: "/e-shop" }, { label: result.name }]}
      />
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-x-12 md:grid-cols-5">
        <div className="col-span-1 md:col-span-2">
          <div className="aspect-square rounded-lg">
            <ImageSlider brightness={false} urls={validUrls} />
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-6 sm:col-span-2 md:col-span-3">
          {/* Product Title and Categories*/}
          {result.category ? (
            <div className="flex flex-wrap items-center justify-start gap-1">
              <Hint side="top" text="Kategórie">
                <TagsIcon className="size-4 text-muted-foreground" />
              </Hint>
              <Link
                className={cn(
                  buttonVariants({ variant: "secondary", size: "xs" }),
                  "rounded-full"
                )}
                href={`/e-shop?category=${result.category.slug}`}
                key={result.category.id}
              >
                {result.category.name}
              </Link>
            </div>
          ) : null}
          <ViewTransition name={`${result.slug}-name`}>
            <h1 className="line-clamp-2 font-semibold text-2xl leading-tight tracking-tight md:text-3xl">
              {result.name}
            </h1>
          </ViewTransition>

          {/* Product Price and Features */}
          <ViewTransition name={`${result.slug}-price`}>
            <h2 className="font-semibold text-2xl tracking-tight md:text-4xl">
              {formatPrice(result.priceCents)}
            </h2>
          </ViewTransition>
          <div className="flex flex-col items-start justify-start gap-2 md:flex-row md:items-center">
            {isInStock ? (
              <Badge className="w-fit" variant="success">
                <CheckCircleIcon />
                Skladom
              </Badge>
            ) : (
              <Badge className="w-fit" variant="destructive">
                <ClockIcon />
                Nie je skladom
              </Badge>
            )}
            {hasPickupRestriction && (
              <div className="flex flex-row flex-wrap items-center gap-1">
                <Hint text="Dostupné len v týchto dňoch">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                </Hint>
                {pickupDates.map((date) => (
                  <Badge key={date} size="xs" variant="secondary">
                    {format(new Date(date), "dd. MMM", { locale: sk })}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="grow">
            <div
              className="prose prose-stone dark:prose-invert prose-p:mb-4 max-w-none"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted content from admin editor
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
          <Separator />
          <div className="flex w-full items-center justify-between gap-2">
            <AddWithQuantityButton disabled={!isInStock} id={result.id} />
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={<PageWrapper>Loading...</PageWrapper>}>
      <ProductPageContent params={params} />
    </Suspense>
  );
}
