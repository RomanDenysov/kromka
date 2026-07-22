import type { Route } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { getDomain, getDomainHref } from "@/features/admin-shell/config.shared";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { DomainSecondaryNav } from "./domain-secondary-nav";

interface AdminDomainLayoutProps {
  children: ReactNode;
  domainSlug: string;
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
        <DomainSecondaryNav domainSlug={domainSlug} />
      </Suspense>
      {children}
    </>
  );
}
