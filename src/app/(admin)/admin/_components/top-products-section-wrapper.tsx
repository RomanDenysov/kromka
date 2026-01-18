import { getTopProducts } from "@/features/admin-dashboard/api/queries";
import { getFrequentlyBoughtTogether } from "@/features/admin-dashboard/api/metrics";
import { TopProductsSection } from "./top-products-section";

export async function TopProductsSectionWrapper() {
  const [topProducts, frequentlyBought] = await Promise.all([
    getTopProducts(),
    getFrequentlyBoughtTogether(),
  ]);

  return (
    <TopProductsSection
      frequentlyBought={frequentlyBought}
      topProducts={topProducts}
    />
  );
}
