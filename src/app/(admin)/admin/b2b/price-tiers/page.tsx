import { ArrowRightIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPriceTiers } from "@/features/b2b/price-tiers/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";

async function PriceTiersLoader() {
  const tiers = await getPriceTiers();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tiers.map((tier) => (
        <Card key={tier.id}>
          <CardHeader>
            <CardTitle>{tier.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground text-sm">
              {tier.description ?? "Bez popisu"}
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/b2b/price-tiers/${tier.id}` as Route}>
                Upraviť
                <ArrowRightIcon className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function B2BPriceTiersPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" as Route },
          { label: "B2B", href: "/admin/b2b" as Route },
          { label: "Cenové skupiny", href: "/admin/b2b/price-tiers" as Route },
        ]}
      />
      <section className="h-full flex-1 p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <PriceTiersLoader />
        </Suspense>
      </section>
    </>
  );
}
