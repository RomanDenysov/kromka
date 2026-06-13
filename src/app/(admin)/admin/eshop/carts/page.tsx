import { Suspense } from "react";
import { CartContainer } from "./components/cart-container";

export default function AdminCartsPage() {
  return (
    <Suspense>
      <CartContainer />
    </Suspense>
  );
}
