import { getLastOrderPrefillAction } from "@/features/checkout/api/actions";
import { getStores } from "@/features/stores/api/queries";
import { HomepageStoresContent } from "./homepage-stores-content";

export async function HomepageStoresSection() {
  const stores = await getStores();

  if (stores.length === 0) {
    return null;
  }

  let initialStoreId = stores[0].id;

  const prefill = await getLastOrderPrefillAction();
  if (prefill?.storeId) {
    const lastOrderStore = stores.find((s) => s.id === prefill.storeId);
    if (lastOrderStore) {
      initialStoreId = lastOrderStore.id;
    }
  }

  return (
    <HomepageStoresContent initialStoreId={initialStoreId} stores={stores} />
  );
}
