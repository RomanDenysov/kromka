import { notFound } from "next/navigation";
import { getProduct } from "@/actions/products/queries";

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
  return <div>{product.name}</div>;
}
