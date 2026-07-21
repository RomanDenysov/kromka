import { AdminDomainLayout } from "@/features/admin-shell/components/admin-domain-layout";

export default function ReportsLayout({
  children,
}: LayoutProps<"/admin/reports">) {
  return <AdminDomainLayout domainSlug="reports">{children}</AdminDomainLayout>;
}
