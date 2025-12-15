import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUnusedProducts } from "@/lib/queries/dashboard-metrics";

export async function UnusedProductsAlert() {
  const unusedProducts = await getUnusedProducts();

  if (unusedProducts.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 font-medium text-sm">
          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          Nevyužitý potenciál
        </CardTitle>
        <span className="font-bold text-lg text-orange-600 dark:text-orange-400">
          {unusedProducts.length}
        </span>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-muted-foreground text-xs">
          Aktívne produkty bez objednávok za posledných 30+ dní
        </p>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {unusedProducts.slice(0, 10).map((product) => (
            <div
              className="flex items-center justify-between text-sm"
              key={product.productId}
            >
              <Link
                className="text-primary hover:underline"
                href={`/admin/products/${product.productId}`}
              >
                {product.productName}
              </Link>
              <span className="text-muted-foreground text-xs">
                {product.daysSinceLastOrder === null
                  ? "Nikdy"
                  : `${product.daysSinceLastOrder} dní`}
              </span>
            </div>
          ))}
          {unusedProducts.length > 10 && (
            <p className="pt-2 text-muted-foreground text-xs">
              + {unusedProducts.length - 10} ďalších
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
