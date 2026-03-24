import { getLastOrderWithItemsAction } from "@/features/checkout/api/actions";
import { BuyAgainBannerClient } from "./buy-again-banner-client";

export async function BuyAgainBanner() {
  const lastOrder = await getLastOrderWithItemsAction();
  if (!lastOrder) {
    return null;
  }

  return <BuyAgainBannerClient items={lastOrder.items} />;
}
