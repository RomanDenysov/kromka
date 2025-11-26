import type { ReactNode } from "react";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { batchPrefetch, trpc } from "@/trpc/server";

type Props = {
  readonly children: ReactNode;
  readonly featured: ReactNode;
  readonly categories: ReactNode;
};

export default function EShopLayout({ children, featured, categories }: Props) {
  batchPrefetch([
    trpc.public.products.list.queryOptions(),
    trpc.public.categories.list.queryOptions(),
  ]);

  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "E-shop", href: "/e-shop" }]} />
      {featured}
      {categories}
      {children}
    </PageWrapper>
  );
}
