import { notFound } from "next/navigation";
import { db } from "@/db";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await db.query.categories.findFirst({
    where: (c, { eq }) => eq(c.id, id),
  });

  if (!category) {
    notFound();
  }
  return <div>{category.name}</div>;
}
