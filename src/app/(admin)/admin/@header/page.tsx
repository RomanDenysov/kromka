import { AdminHeader } from "@/components/shared/admin-header";

export default function AdminHeaderPage() {
  return <AdminHeader breadcrumbs={[{ label: "Dashboard", href: "/admin" }]} />;
}
