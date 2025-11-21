import Link from "next/link";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { Container } from "@/components/shared/container";

const _products = [{}];

export default function EshopPage() {
  return (
    <Container className="flex h-full flex-col gap-6 border py-6 md:py-12">
      <div className="min-h-60 border-border border-b bg-muted">
        <FeaturedCarousel />
      </div>
      <div className="flex flex-col gap-2 border">
        <h2>CATEGORIES</h2>
        <div className="flex flex-wrap gap-2">
          <Link className="text-sm" href="/eshop?category=1">
            Category 1
          </Link>
          <Link className="text-sm" href="/eshop?category=2">
            Category 2
          </Link>
          <Link className="text-sm" href="/eshop?category=3">
            Category 3
          </Link>
        </div>
      </div>
      <div className="flex h-full flex-1 grow flex-col gap-2 border">
        <h1>Eshop</h1>
      </div>
    </Container>
  );
}

// We will call the endpoint to get the:
// - Featured products (which category should be displayed as featured)
// - Categories (list of categories)
// - Products (list of products)

// We need some table in database to store the configuration for the eshop (featured category, categories, products)
