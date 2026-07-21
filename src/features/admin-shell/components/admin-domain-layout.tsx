import type { Route } from "next";
import { type ReactNode, Suspense } from "react";
import { AdminSectionTabs } from "@/features/admin-shell/components/admin-section-tabs";
import { getDomain, getDomainHref } from "@/features/admin-shell/config.shared";
import { getAdminSidebarBadges } from "@/features/admin-sidebar/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";

interface AdminDomainLayoutProps {
  children: ReactNode;
  domainSlug: string;
}

async function DomainSectionTabs({ domainSlug }: { domainSlug: string }) {
  const badges = await getAdminSidebarBadges();
  return <AdminSectionTabs badges={badges} domainSlug={domainSlug} />;
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
