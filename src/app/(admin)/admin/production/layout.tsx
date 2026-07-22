import { AdminDomainLayout } from "@/features/admin-shell/components/admin-domain-layout";

export default function ProductionLayout({
  children,
}: LayoutProps<"/admin/production">) {
  return (
    <AdminDomainLayout domainSlug="production">{children}</AdminDomainLayout>
  );
}
