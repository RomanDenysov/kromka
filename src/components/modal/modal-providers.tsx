import { Suspense } from "react";
import { getAuth } from "@/lib/auth/session";
import { getStores } from "@/lib/queries/stores";
import { StoreSelectModal } from "./store-select-modal";

export async function ModalProviders() {
  const [{ store }, stores] = await Promise.all([getAuth(), getStores()]);
  return (
    <Suspense>
      <StoreSelectModal currentStoreId={store?.id ?? null} stores={stores} />
    </Suspense>
  );
}
