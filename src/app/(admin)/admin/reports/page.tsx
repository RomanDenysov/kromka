import { BarChart3Icon, PackageIcon, StoreIcon } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/widgets/admin-header/admin-header";

const REPORT_LINKS = [
  {
    href: "/admin/reports/profitability/stores",
    label: "Ziskovosť predajní",
    description: "Tržby, náklady a marža podľa predajne.",
    icon: StoreIcon,
  },
  {
    href: "/admin/reports/profitability/products",
    label: "Ziskovosť produktov",
    description:
      "Ktoré produkty zarábajú najviac. Zoradené podľa hrubej marže.",
    icon: PackageIcon,
  },
] as const;

export default function ReportsLandingPage() {
  // Middleware guards /admin/*; route handlers / actions guard their own
  // paths. Summary KPIs live on the /admin dashboard widget — duplicating
  // them here would force new Date() into a server component before any
  // uncached read, which Next.js 16 cacheComponents disallows.
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Reporty" },
        ]}
      />
      <section className="@container/page space-y-6 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {REPORT_LINKS.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                className="group rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
                href={r.href as never}
                key={r.href}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="size-5 text-muted-foreground group-hover:text-foreground" />
                  <h3 className="font-semibold text-sm">{r.label}</h3>
                </div>
                <p className="text-muted-foreground text-xs">{r.description}</p>
              </Link>
            );
          })}
        </div>

        <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <BarChart3Icon className="size-3" />
          Reporty používajú hrubú maržu (tržby − náklady na výrobu). Réžia, mzdy
          a iné prevádzkové náklady tu nie sú zahrnuté.
        </p>
      </section>
    </>
  );
}
