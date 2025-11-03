import { notFound } from "next/navigation";
import { getCategory } from "@/actions/categories/queries";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await getCategory(id);
  if (!category) {
    notFound();
  }
  return <div>{category.name}</div>;
}
