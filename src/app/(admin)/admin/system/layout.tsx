import { AdminDomainLayout } from "@/features/admin-shell/components/admin-domain-layout";

export default function SystemLayout({
  children,
}: LayoutProps<"/admin/system">) {
  return <AdminDomainLayout domainSlug="system">{children}</AdminDomainLayout>;
}
