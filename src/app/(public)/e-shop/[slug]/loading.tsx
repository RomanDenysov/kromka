import { PageWrapper } from "@/components/shared/container";
import { SingleProductSkeleton } from "@/components/single-product";

export default function EshopProductLoading() {
  return (
    <PageWrapper>
      <SingleProductSkeleton />
    </PageWrapper>
  );
}
