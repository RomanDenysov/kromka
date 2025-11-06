import { getProduct } from "@/actions/products/queries";
import { AdminHeader } from "@/components/admin-header/admin-header";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function B2CProductAdminHeaderPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  const title = product ? product.name : "Nový produkt";

  return (
    <AdminHeader
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Produkty", href: "/admin/b2c/products" },
        { label: title },
      ]}
    />
  );
}
