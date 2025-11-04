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
  return (
    <div className="flex size-full">
      <div className="size-full max-w-md shrink-0 border-r bg-muted md:max-w-lg">
        {product.name}
      </div>
    </div>
  );
}
