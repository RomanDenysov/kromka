import { AdminHeader } from "@/components/admin-header/admin-header";

export default function SettingsPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[{ label: "Nastavenia", href: "/admin/settings" }]}
      />
      <div className="flex-1">
        <h1 className="font-bold text-2xl">Nastavenia</h1>
        <p className="text-gray-500 text-sm">
          Tu môžete upraviť nastavenia systému.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-md">
            <h2 className="font-bold text-lg">Nastavenia</h2>
          </div>
        </div>
      </div>
    </>
  );
}
