import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { SingleProduct } from "@/components/single-product";
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
        <Suspense>
          <SingleProduct slug={slug} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
