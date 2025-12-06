import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { CheckCircleIcon, ClockIcon, TagsIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { AddToCartSingleProductButton } from "@/components/add-to-cart-signle-product-button";
import { ImageSlider } from "@/components/image-slider";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { Hint } from "@/components/shared/hint";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getProductBySlug } from "@/lib/queries/products";
import { cn, formatPrice } from "@/lib/utils";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return await db.select({ slug: products.slug }).from(products);
}

async function ProductPageContent({ params }: Props) {
  const { slug } = await params;
  const urlDecoded = decodeURIComponent(slug);
  const result = await getProductBySlug(urlDecoded);

  if (!result) {
    notFound();
  }
  const validUrls = result.images;
  const isInStock = result.status === "active";

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
          <div className="flex flex-col items-start justify-start gap-2 md:flex-row">
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
            <AddToCartSingleProductButton
              disabled={!isInStock}
              product={{
                id: result.id,
                name: result.name,
                priceCents: result.priceCents,
                slug: result.slug,
                imageUrl: validUrls[0],
              }}
            />
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
