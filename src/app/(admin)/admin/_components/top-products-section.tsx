import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTopProducts } from "@/lib/queries/dashboard";
import { formatPrice } from "@/lib/utils";

export async function TopProductsSection() {
  const products = await getTopProducts();
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Top Produkty</CardTitle>
        <CardDescription>
          Najpredávanejšie produkty podľa počtu kusov.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
