type Product = Awaited<
  ReturnType<typeof import("@/actions/products/queries").getProducts>
>[number];

export function ProductsTable({ products }: { products: Product[] }) {
  return (
    <div className="flex-1 p-4">
      <div className="text-muted-foreground text-sm">
        {products.length} product{products.length !== 1 ? "s" : ""}
      </div>
      {/* TODO: Implement products table */}
    </div>
  );
}
