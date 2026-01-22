"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { getFrequentlyBoughtTogether } from "@/features/admin-dashboard/api/metrics";
import type { getTopProducts } from "@/features/admin-dashboard/api/queries";
import { formatPrice } from "@/lib/utils";

type TopProductsSectionProps = {
  topProducts: Awaited<ReturnType<typeof getTopProducts>>;
  frequentlyBought: Awaited<ReturnType<typeof getFrequentlyBoughtTogether>>;
};

export function TopProductsSection({
  topProducts,
  frequentlyBought,
}: TopProductsSectionProps) {
  const [activeTab, setActiveTab] = useState("top");

  return (
    <Card className="col-span-3">
      <Tabs onValueChange={setActiveTab} value={activeTab}>
        <CardHeader>
          <CardTitle>Produkty</CardTitle>
          <CardDescription>
            {activeTab === "top"
              ? "Najpredávanejšie produkty podľa počtu kusov."
              : "Produkty, ktoré sa často objednávajú spolu."}
          </CardDescription>
          <TabsList>
            <TabsTrigger value="top">
              Top Produkty ({topProducts.length})
            </TabsTrigger>
            <TabsTrigger value="frequently">
              Často spolu ({frequentlyBought.length})
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="top">
            <TopProductsList products={topProducts} />
          </TabsContent>
          <TabsContent value="frequently">
            <FrequentlyBoughtList pairs={frequentlyBought} />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}

function TopProductsList({
  products,
}: {
  products: TopProductsSectionProps["topProducts"];
}) {
  if (products.length === 0) {
    return <p className="text-muted-foreground text-sm">Žiadne údaje</p>;
  }

  return (
    <ul className="space-y-4">
      {products.map((product) => (
        <li className="flex items-center gap-4 text-sm" key={product.id}>
          <div className="space-y-1">
            <Link
              className="font-medium leading-none"
              href={`/admin/products/${product.id}`}
            >
              {product.name}
            </Link>
            <p className="text-muted-foreground">
              {product.quantity} predaných kusov
            </p>
          </div>
          <div className="ml-auto font-medium">
            {formatPrice(product.revenue)}
          </div>
        </li>
      ))}
    </ul>
  );
}

function FrequentlyBoughtList({
  pairs,
}: {
  pairs: TopProductsSectionProps["frequentlyBought"];
}) {
  if (pairs.length === 0) {
    return <p className="text-muted-foreground text-sm">Žiadne údaje</p>;
  }

  return (
    <div className="space-y-3">
      {pairs.map((pair) => (
        <div
          className="flex items-start justify-between gap-2 text-sm"
          key={`${pair.product1Id}-${pair.product2Id}`}
        >
          <div className="flex-1 space-y-1">
            <div className="font-medium">{pair.product1Name}</div>
            <div className="text-muted-foreground text-xs">
              + {pair.product2Name}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{pair.frequency}x</span>
          </div>
        </div>
      ))}
    </div>
  );
}
