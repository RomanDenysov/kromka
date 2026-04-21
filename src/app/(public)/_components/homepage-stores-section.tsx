import { getLastOrderPrefillAction } from "@/features/checkout/api/actions";
import { getStores } from "@/features/stores/api/queries";
import { HomepageStoresContent } from "./homepage-stores-content";

export async function HomepageStoresSection() {
  const stores = await getStores();

  if (stores.length === 0) {
    return null;
  }

  const prefill = await getLastOrderPrefillAction();
  const initialStoreId =
    stores.find((s) => s.id === prefill?.storeId)?.id ?? stores[0].id;

  return (
    <HomepageStoresContent initialStoreId={initialStoreId} stores={stores} />
  );
}
