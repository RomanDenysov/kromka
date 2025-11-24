import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { PageWrapper } from "@/components/shared/container";
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
        <PageWrapper>
          <Suspense fallback={<SingleProductSkeleton />}>
            <SingleProduct slug={slug} />
          </Suspense>
        </PageWrapper>
      </ErrorBoundary>
    </HydrateClient>
  );
}
