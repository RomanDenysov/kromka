import type { Row } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { RowToggleButton } from "@/widgets/data-table/ui/row-toggle-button";
import type { Product } from "./products-table";

const MAX_CATEGORIES = 3;

export const productsColumns = [
  {
    header: "Názov",
    accessorKey: "name",
  },
  {
    header: "Cena",
    accessorKey: "prices",
    cell: ({ row }: { row: Row<Product> }) =>
      row.original.prices.map((price) => (
        <div key={price.id}>{price.amountCents}</div>
      )),
  },
  {
    header: "Kategórie",
    accessorKey: "categories",
    cell: ({ row }: { row: Row<Product> }) =>
      row.original.categories.slice(0, MAX_CATEGORIES).map((category) => (
        <Badge className="mr-0.5" key={category.category.id} size="xs">
          {category.category.name}
        </Badge>
      )),
  },
  {
    header: "Aktívny",
    accessorKey: "isActive",
    cell: ({ row }: { row: Row<Product> }) => (
      <RowToggleButton
        isActive={row.original.isActive}
        onChange={(isActive) => {
          // biome-ignore lint/suspicious/noConsole: <explanation>
          console.log("isActive", isActive);
        }}
        size="xs"
      />
    ),
  },
];
