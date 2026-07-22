import { AdminDomainLayout } from "@/features/admin-shell/components/admin-domain-layout";

export default function B2bLayout({ children }: LayoutProps<"/admin/b2b">) {
  return <AdminDomainLayout domainSlug="b2b">{children}</AdminDomainLayout>;
}
