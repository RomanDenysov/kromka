import { AdminHeader } from "@/components/admin-header/admin-header";

export default function AdminPage() {
  return <AdminHeader breadcrumbs={[{ label: "Dashboard", href: "/admin" }]} />;
}
