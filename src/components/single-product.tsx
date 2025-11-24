"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import {
  CheckCircleIcon,
  ClockIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  TagsIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo, useState } from "react";
import { ImageSlider } from "@/components/image-slider";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartActions } from "@/hooks/use-cart-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn, formatPrice } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Hint } from "./shared/hint";
import { Badge } from "./ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Button, buttonVariants } from "./ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "./ui/button-group";

export function SingleProduct({ slug }: { slug: string }) {
  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.public.products.bySlug.queryOptions({ slug })
  );

  const isInStock = product?.status === "active" && product?.isActive;

  const descriptionHtml = useMemo(
    () =>
      generateHTML(
        product?.description ?? {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "" }] },
          ],
        },
        [StarterKit]
      ) ?? undefined,
    [product?.description]
  );
  if (!product) {
    notFound();
  }
  const validUrls = useMemo(() => product.images, [product.images]);
  const category = product.categories[0];

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Domov</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/eshop">E-shop</BreadcrumbLink>
          </BreadcrumbItem>
          {category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/eshop?category=${category.slug}`}>
                  {category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-3 sm:gap-x-12 md:grid-cols-5">
        <div className="col-span-1 md:col-span-2">
          <div className="aspect-square rounded-lg">
            <ImageSlider brightness={false} urls={validUrls} />
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-6 sm:col-span-2 md:col-span-3">
          {/* Product Title and Categories*/}
          {product.categories.length > 0 && (
            <div className="flex flex-wrap items-center justify-start gap-1">
              <Hint side="top" text="Kategórie">
                <TagsIcon className="size-4 text-muted-foreground" />
              </Hint>
              {product.categories.map((cat) => (
                <Link
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "xs" }),
                    "rounded-full"
                  )}
                  href={`/eshop?category=${cat.slug}`}
                  key={cat.id}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
          <h1 className="line-clamp-2 font-semibold text-2xl leading-tight tracking-tight md:text-3xl">
            {product.name}
          </h1>

          {/* Product Price and Features */}
          <h2 className="font-semibold text-2xl tracking-tight md:text-4xl">
            {formatPrice(product.priceCents)}
          </h2>
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
              id={product.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AddToCartSingleProductButton({
  disabled,
  id,
  maxQuantity = 100,
}: {
  disabled: boolean;
  id: string;
  maxQuantity?: number;
}) {
  const isMobile = useIsMobile();
  const [quantity, setQuantity] = useState(Math.min(1, maxQuantity));
  const { addToCart, isUpdatingQuantity } = useCartActions();
  return (
    <div className="flex w-full flex-col items-start justify-between gap-6 md:flex-row md:items-center">
      <div className="flex items-center gap-2">
        <span className="font-medium">Množstvo:</span>
        <ButtonGroup
          aria-label="Product quantity setter"
          aria-roledescription="Product quantity setter"
        >
          <Button
            aria-label="Decrease product quantity"
            aria-roledescription="Decrease product quantity"
            disabled={disabled || isUpdatingQuantity}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            size={isMobile ? "icon" : "icon-lg"}
            variant="secondary"
          >
            <MinusIcon />
          </Button>
          <ButtonGroupSeparator />
          <ButtonGroupText className="min-w-10 items-center justify-center text-center text-sm md:min-w-14 md:text-base">
            {quantity}
          </ButtonGroupText>
          <ButtonGroupSeparator />
          <Button
            aria-label="Increase product quantity"
            aria-roledescription="Increase product quantity"
            disabled={disabled || isUpdatingQuantity}
            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            size={isMobile ? "icon" : "icon-lg"}
            variant="secondary"
          >
            <PlusIcon />
          </Button>
        </ButtonGroup>
      </div>
      <Button
        className="w-full flex-1 md:w-auto md:text-base"
        disabled={disabled || isUpdatingQuantity}
        onClick={() => addToCart({ productId: id, quantity })}
        size={isMobile ? "default" : "lg"}
      >
        <ShoppingCartIcon />
        <span>Do košíka</span>
      </Button>
    </div>
  );
}

export function SingleProductSkeleton() {
  return (
    <div className="flex grow flex-col gap-8">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-3 sm:gap-x-12 md:grid-cols-5">
        <div className="col-span-1 md:col-span-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
        </div>
        <div className="col-span-1 flex flex-col gap-6 sm:col-span-2 md:col-span-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-3/4" />
          </div>
          <Separator />
          <Skeleton className="h-8 w-32" />
          <div className="h-[200px] w-full">
            <Skeleton className="size-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
