import { AdminHeader } from "@/components/admin-header/admin-header";

export default function AdminHeaderPage() {
  return <AdminHeader breadcrumbs={[{ label: "Dashboard", href: "/admin" }]} />;
}
