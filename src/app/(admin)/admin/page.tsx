import { AdminHeader } from "@/components/shared/admin-header";

export default function AdminPage() {
  return (
    <div>
      <AdminHeader breadcrumbs={[{ label: "Admin", href: "/admin" }]} />
    </div>
  );
}
