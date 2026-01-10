import { CallToAction } from "@/components/landing/cta";
import { HomeGrid } from "@/components/landing/home-grid";
import { preloadFavorites } from "@/features/favorites/queries";
import { preloadProducts } from "@/features/products/queries";

export default function Home() {
  preloadProducts();
  preloadFavorites();
  return (
    <>
      <HomeGrid />
      <CallToAction />
    </>
  );
}
