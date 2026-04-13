import { redirect } from "next/navigation";
import { Suspense } from "react";

interface Props {
  params: Promise<{ storeSlug: string }>;
}

async function RedirectToPickups({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}): Promise<null> {
  const { storeSlug } = await params;
  redirect(`/predajna/${storeSlug}/vyzdvihnutia`);
}

export default function StoreIndexPage({ params }: Props) {
  return (
    <Suspense>
      <RedirectToPickups params={params} />
    </Suspense>
  );
}
