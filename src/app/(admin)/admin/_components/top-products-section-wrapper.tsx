import { getTopProducts } from "@/lib/queries/dashboard";
import { getFrequentlyBoughtTogether } from "@/lib/queries/dashboard-metrics";
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
