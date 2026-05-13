import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllergens } from "@/features/allergens/api/queries";
import { ALLERGEN_ICONS } from "@/features/allergens/lib/icons";
import { getAllergenDrift } from "@/features/products/api/allergen-drift";
import { requireRecipeView } from "@/lib/auth/guards";
import { AdminHeader } from "@/widgets/admin-header/admin-header";

interface Props {
  searchParams: Promise<{ offset?: string; limit?: string }>;
}

const PAGE_SIZE = 50;

export default async function AllergenDriftPage({ searchParams }: Props) {
  await requireRecipeView();
  const params = await searchParams;
  const offset = Number.parseInt(params.offset ?? "0", 10) || 0;
  const limit =
    Number.parseInt(params.limit ?? String(PAGE_SIZE), 10) || PAGE_SIZE;

  const [drift, allergens] = await Promise.all([
    getAllergenDrift({ offset, limit }),
    getAllergens(),
  ]);

  const allergenByCode = new Map(allergens.map((a) => [a.code, a]));

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Recepty", href: "/admin/recipes" },
          { label: "Rozdiely alergénov" },
        ]}
      />
      <section className="@container/page space-y-4 p-4">
        <div>
          <h2 className="font-semibold text-xl tracking-tight">
            Rozdiely alergénov
          </h2>
          <p className="text-muted-foreground text-sm">
            Produkty s receptom, kde sa ručne označené alergény nezhodujú s
            alergénmi odvodenými zo surovín. Diagnostický nástroj.
          </p>
        </div>

        {drift.items.length === 0 ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Žiadne rozdiely — všetky produkty s receptom majú alergény v
            poriadku.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-muted-foreground text-xs">
                <tr>
                  <th className="px-3 py-2 font-medium">Produkt</th>
                  <th className="px-3 py-2 font-medium">Ručne</th>
                  <th className="px-3 py-2 font-medium">Z receptu</th>
                  <th className="px-3 py-2 font-medium">Rozdiel</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {drift.items.map((row) => (
                  <tr
                    className="border-b align-top hover:bg-muted/30"
                    key={row.productId}
                  >
                    <td className="px-3 py-2">
                      <Link
                        className="font-medium hover:underline"
                        href={`/admin/products/${row.productId}` as never}
                      >
                        {row.productName}
                      </Link>
                      {row.resolverError && (
                        <p className="mt-0.5 text-destructive text-xs">
                          {row.resolverError}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Chips
                        allergenByCode={allergenByCode}
                        codes={row.manualCodes}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Chips
                        allergenByCode={allergenByCode}
                        codes={row.derivedCodes}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        {row.added.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-emerald-600 text-xs dark:text-emerald-400">
                              +
                            </span>
                            <Chips
                              allergenByCode={allergenByCode}
                              codes={row.added}
                              variant="success"
                            />
                          </div>
                        )}
                        {row.removed.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-destructive text-xs">−</span>
                            <Chips
                              allergenByCode={allergenByCode}
                              codes={row.removed}
                              variant="destructive"
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          href={`/admin/products/${row.productId}` as never}
                        >
                          Otvoriť
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>
            Strana {Math.floor(offset / limit) + 1}, položiek{" "}
            {drift.items.length}
          </span>
          <div className="flex items-center gap-2">
            {offset > 0 && (
              <Button asChild size="sm" variant="ghost">
                <Link
                  href={
                    `/admin/recipes/drift?offset=${Math.max(0, offset - limit)}&limit=${limit}` as never
                  }
                >
                  Predchádzajúca
                </Link>
              </Button>
            )}
            {drift.items.length === limit && (
              <Button asChild size="sm" variant="ghost">
                <Link
                  href={
                    `/admin/recipes/drift?offset=${offset + limit}&limit=${limit}` as never
                  }
                >
                  Ďalšia
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Chips({
  codes,
  allergenByCode,
  variant = "secondary",
}: {
  codes: string[];
  allergenByCode: Map<string, { code: string; nameSk: string }>;
  variant?: "secondary" | "success" | "destructive";
}) {
  if (codes.length === 0) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {codes.map((code) => {
        const a = allergenByCode.get(code);
        const Icon = ALLERGEN_ICONS[code as keyof typeof ALLERGEN_ICONS];
        return (
          <Badge className="gap-1 text-[10px]" key={code} variant={variant}>
            {Icon && <Icon className="size-3" />}
            {a?.nameSk ?? code}
          </Badge>
        );
      })}
    </div>
  );
}
