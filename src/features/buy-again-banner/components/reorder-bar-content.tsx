import { getLastOrderWithItemsAction } from "@/features/checkout/api/actions";
import { ReorderBar } from "./reorder-bar";

export async function ReorderBarContent() {
  const lastOrder = await getLastOrderWithItemsAction();
  if (!lastOrder) {
    return null;
  }

  return <ReorderBar items={lastOrder.items} />;
}
