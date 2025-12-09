import { getAuth } from "@/lib/auth/session";
import { getCart } from "@/lib/queries/cart";
import { getStores } from "@/lib/queries/stores";
import { CheckoutForm } from "./checkout-form";

export async function CheckoutFormContainer() {
  const { user } = await getAuth();
  const cart = await getCart();
  const stores = await getStores();
  return <CheckoutForm cart={cart} stores={stores} user={user} />;
}
