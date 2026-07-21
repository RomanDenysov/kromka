import { AdminDomainLayout } from "@/features/admin-shell/components/admin-domain-layout";

export default function BlogLayout({ children }: LayoutProps<"/admin/blog">) {
  return <AdminDomainLayout domainSlug="blog">{children}</AdminDomainLayout>;
}
