import { AdminHeader } from "@/components/admin-header/admin-header";

export default function StoresHeader() {
  return (
    <AdminHeader
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Obchody" },
      ]}
    />
  );
}
