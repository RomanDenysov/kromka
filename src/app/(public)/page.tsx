import { CallToAction } from "@/components/landing/cta";
import { HomeGrid } from "@/components/landing/home-grid";
import { preloadProducts } from "@/lib/queries/products";

export default function Home() {
  preloadProducts();

  return (
    <>
      <HomeGrid />
      <CallToAction />
    </>
  );
}
