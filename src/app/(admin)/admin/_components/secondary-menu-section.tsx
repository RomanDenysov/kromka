import { getCartsCount, getOrdersCount } from "@/lib/queries/dashboard";
import { SecondaryMenu } from "../(dashboard)/secondary-menu";

export async function SecondaryMenuSection() {
  const [ordersCount, cartsCount] = await Promise.all([
    getOrdersCount(),
    getCartsCount(),
  ]);
  return (
    <SecondaryMenu
      className="shrink-0"
      items={[
        {
          href: "/admin",
          label: `Objednávky (${ordersCount})`,
        },
        {
          href: "/admin/carts",
          label: `Košíky (${cartsCount})`,
        },
      ]}
    />
  );
}
