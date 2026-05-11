import type { Route } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { STORE_MANAGER_BASE_PATH } from "@/features/store-manager/paths";

interface Props {
  params: Promise<{ storeSlug: string }>;
}

async function RedirectToPickups({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}): Promise<null> {
  const { storeSlug } = await params;
  redirect(`${STORE_MANAGER_BASE_PATH}/${storeSlug}/vyzdvihnutia` as Route);
}

export default function StoreIndexPage({ params }: Props) {
  return (
    <Suspense>
      <RedirectToPickups params={params} />
    </Suspense>
  );
}
