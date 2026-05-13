import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getIngredientDuplicates } from "@/features/ingredients/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";

async function DuplicatesContent() {
  const pairs = await getIngredientDuplicates(0.7);

  if (pairs.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        Žiadne duplicitné páry (prah 0.7).
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40 text-left text-muted-foreground text-xs">
          <tr>
            <th className="px-3 py-2 font-medium">Surovina A</th>
            <th className="px-3 py-2 font-medium">Surovina B</th>
            <th className="px-3 py-2 font-medium">Podobnosť</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {pairs.map((p) => (
            <tr
              className="border-b hover:bg-muted/30"
              key={`${p.a_id}-${p.b_id}`}
            >
              <td className="px-3 py-2">
                <Link
                  className="hover:underline"
                  href={`/admin/ingredients/${p.a_id}` as never}
                >
                  {p.a_name}
                </Link>
              </td>
              <td className="px-3 py-2">
                <Link
                  className="hover:underline"
                  href={`/admin/ingredients/${p.b_id}` as never}
                >
                  {p.b_name}
                </Link>
              </td>
              <td className="px-3 py-2">
                <Badge variant={p.score > 0.85 ? "destructive" : "secondary"}>
                  {p.score.toFixed(2)}
                </Badge>
              </td>
              <td className="px-3 py-2 text-right">
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/admin/ingredients/${p.a_id}` as never}>
                    Otvoriť A
                  </Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/admin/ingredients/${p.b_id}` as never}>
                    Otvoriť B
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function IngredientDuplicatesPage() {
  // Middleware guards /admin/*; server actions handle mutations.
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Suroviny", href: "/admin/ingredients" },
          { label: "Duplicity" },
        ]}
      />
      <section className="@container/page space-y-4 p-4">
        <div>
          <h2 className="font-semibold text-xl tracking-tight">
            Možné duplicity
          </h2>
          <p className="text-muted-foreground text-sm">
            Páry surovín s vysokou podobnosťou názvu. Diagnostický nástroj —
            zlúčenie sa robí ručne (otvorte detail a porovnajte).
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-64" />}>
          <DuplicatesContent />
        </Suspense>
      </section>
    </>
  );
}
