import { getLastOrderWithItemsAction } from "@/features/checkout/api/actions";
import { BuyAgainBannerClient } from "./variant-a";

export async function BuyAgainBanner() {
  const lastOrder = await getLastOrderWithItemsAction();
  if (!lastOrder) {
    return null;
  }

  return <BuyAgainBannerClient items={lastOrder.items} />;
}
