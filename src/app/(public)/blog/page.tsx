import type { Metadata } from "next";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";

export const metadata: Metadata = createMetadata({
  title: "Blog",
  description:
    "Recepty, tipy a novinky zo sveta pekárenstva. Prečítajte si náš blog a inšpirujte sa.",
  canonicalUrl: getSiteUrl("/blog"),
});

export default function BlogPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "Blog", href: "/blog" }]} />
    </PageWrapper>
  );
}
