import { notFound } from "next/navigation";
import { getProduct } from "@/actions/products/queries";
import { AdminHeader } from "@/components/shared/admin-header";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function B2CProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    notFound();
  }
  return (
    <AdminHeader
      breadcrumbs={[
        { label: "Produkty", href: "/admin/b2c/products" },
        { label: product.name },
      ]}
    />
  );
}
