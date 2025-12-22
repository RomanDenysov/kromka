import { CallToAction } from "@/components/landing/cta";
import { HomeGrid } from "@/components/landing/home-grid";
import { preloadFavorites } from "@/lib/favorites/queries";
import { preloadProducts } from "@/lib/queries/products";

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
