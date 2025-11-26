import type { ReactNode } from "react";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";

type Props = {
  readonly children: ReactNode;
  readonly featured: ReactNode;
  readonly categories: ReactNode;
};

export default function EShopLayout({ children, featured, categories }: Props) {
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "E-shop", href: "/e-shop" }]} />
      {featured}
      {categories}
      {children}
    </PageWrapper>
  );
}
