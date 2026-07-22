import { ArrowRightIcon, PlusIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPriceTierAction } from "@/features/b2b/price-tiers/api/actions";
import { getPriceTiers } from "@/features/b2b/price-tiers/api/queries";

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
            <Link
              className={buttonVariants({ size: "sm", variant: "outline" })}
              href={`/admin/b2b/price-tiers/${tier.id}` as Route}
            >
              Upraviť
              <ArrowRightIcon className="ml-2 size-4" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function B2BPriceTiersPage() {
  return (
    <section className="h-full flex-1 space-y-4 p-4">
      <div className="flex justify-end">
        <form action={createPriceTierAction}>
          <Button size="sm" type="submit">
            <PlusIcon className="mr-2 size-4" />
            Vytvoriť novú skupinu
          </Button>
        </form>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <PriceTiersLoader />
      </Suspense>
    </section>
  );
}
