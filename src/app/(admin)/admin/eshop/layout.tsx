import { AdminDomainLayout } from "@/features/admin-shell/components/admin-domain-layout";

export default function EshopLayout({ children }: LayoutProps<"/admin/eshop">) {
  return <AdminDomainLayout domainSlug="eshop">{children}</AdminDomainLayout>;
}
