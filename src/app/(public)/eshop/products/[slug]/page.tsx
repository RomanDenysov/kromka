import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Container } from "@/components/shared/container";
import {
  SingleProduct,
  SingleProductSkeleton,
} from "@/components/single-product";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  prefetch(trpc.public.products.bySlug.queryOptions({ slug }));

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error</div>}>
        <Container className="@container/product-page flex size-full py-5 md:pb-20">
          <Suspense fallback={<SingleProductSkeleton />}>
            <SingleProduct slug={slug} />
          </Suspense>
        </Container>
      </ErrorBoundary>
    </HydrateClient>
  );
}
