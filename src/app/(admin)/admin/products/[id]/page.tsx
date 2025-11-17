import { notFound } from "next/navigation";
import { ErrorState } from "@/components/shared/error-state";
import { db } from "@/db";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function B2CProductPage({ params }: Props) {
  const { id } = await params;
  const product = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.id, id),
  });

  if (!product) {
    notFound();
  }

  return <ErrorState />;

  // return (
  //   <HydrateClient>
  //     <AdminHeader
  //       breadcrumbs={[
  //         { label: "Dashboard", href: "/admin" },
  //         { label: "Produkty", href: "/admin/products" },
  //         { label: product?.name },
  //       ]}
  //     />

  //     <ErrorBoundary fallback={<ErrorState />}>
  //       <Suspense fallback={<FormSkeleton />}>
  //         <ProductForm />
  //       </Suspense>
  //     </ErrorBoundary>
  //   </HydrateClient>
  // );
}
