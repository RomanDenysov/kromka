import { ProductsReelSkeleton } from "@/components/lists/products-reel";

export default function EshopLoading() {
  return <ProductsReelSkeleton />;
  // return (
  //   <PageWrapper>
  //     <div className="space-y-3">
  //       <div className="flex items-center gap-2">
  //         <Skeleton className="h-4 w-12" />
  //         <Skeleton className="h-4 w-4" />
  //         <Skeleton className="h-4 w-20" />
  //       </div>
  //     </div>

  //     <div className="min-h-60 shrink-0">
  //       <Skeleton className="mb-3 h-8 w-40" />
  //       <div className="h-50 w-full rounded-md">
  //         <Skeleton className="h-full w-full rounded-md" />
  //       </div>
  //     </div>

  //     <CategoriesReelSkeleton />

  //   </PageWrapper>
  // );
}
