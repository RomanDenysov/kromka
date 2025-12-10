import { getAuth } from "@/lib/auth/session";
import { getDetailedCart } from "@/lib/cart/queries";
import { getStores } from "@/lib/queries/stores";
import { CheckoutForm } from "./checkout-form";

export async function CheckoutFormContainer() {
  const [{ user }, items, stores] = await Promise.all([
    getAuth(),
    getDetailedCart(),
    getStores(),
  ]);

  return <CheckoutForm items={items} stores={stores} user={user} />;
}
