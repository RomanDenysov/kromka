import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";

export default function BlogPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "Blog", href: "/blog" }]} />
    </PageWrapper>
  );
}
