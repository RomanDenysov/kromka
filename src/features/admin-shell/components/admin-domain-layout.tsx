import type { Route } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { SecondaryNav } from "@/components/secondary-nav";
import { getSectionTabsWithCounts } from "@/features/admin-shell/config.server";
import { getDomain, getDomainHref } from "@/features/admin-shell/config.shared";
import { AdminHeader } from "@/widgets/admin-header/admin-header";

interface AdminDomainLayoutProps {
  children: ReactNode;
  domainSlug: string;
}

async function DomainSectionTabs({ domainSlug }: { domainSlug: string }) {
  const items = await getSectionTabsWithCounts(domainSlug);
  return <SecondaryNav items={items} />;
}

export function AdminDomainLayout({
  domainSlug,
  children,
}: AdminDomainLayoutProps) {
  const domain = getDomain(domainSlug);
  if (!domain) {
    return children;
  }

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          {
            label: domain.label,
            href: getDomainHref(domain.slug) as Route,
          },
        ]}
      />
      <Suspense fallback={<div className="h-10 border-b" />}>
        <DomainSectionTabs domainSlug={domainSlug} />
      </Suspense>
      {children}
    </>
  );
}
