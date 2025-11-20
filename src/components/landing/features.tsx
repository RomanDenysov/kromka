import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { featureFlags } from "@/config/features";
import { cn } from "@/lib/utils";
import { Container } from "../shared/container";

type FeatureCard = {
  id: keyof typeof featureFlags;
  title: string;
  description: string;
  href: Route;
  size?: "sm" | "md" | "lg";
  image: string;
};

const features: FeatureCard[] = [
  {
    id: "eshop",
    title: "E-shop",
    description: "Objednajte si naše pečivo online s doručením až domov",
    href: "/eshop",
    size: "lg",
    image: "/images/eshop.jpg",
  },
  {
    id: "b2b",
    title: "B2B",
    description: "Veľkoodber pre firmy a podnikateľov",
    href: "/b2b",
    size: "md",
    image: "/images/b2b-1.webp",
  },
  // {
  //   id: "partnership",
  //   title: "Partnerstvo",
  //   description: "Predávajte svoje výrobky cez našu sieť",
  //   href: "/partnerstvo",
  //   icon: Handshake,
  //   size: "md",
  // },
  {
    id: "stores",
    title: "Predajne",
    description: "Nájdite najbližšiu predajňu Kromka",
    href: "/predajne",
    size: "md",
    image: "/images/stores.jpg",
  },
  {
    id: "blog",
    title: "Blog",
    description: "Články, tipy a recepty zo sveta pečenia",
    href: "/blog",
    size: "md",
    image: "/images/blog.jpg",
  },
];

export function Features() {
  const visibleFeatures = features.filter(
    (feature) => featureFlags[feature.id]
  );

  return (
    <section className="min-h-[calc(100vh-4rem)] w-full py-5">
      <Container>
        <div className="grid auto-rows-[200px] grid-cols-1 gap-4 md:grid-cols-3">
          {visibleFeatures.map((feature, index) => (
            <Link
              className={cn(
                "group relative overflow-hidden rounded-lg bg-background transition-all hover:shadow-sm",
                feature.size === "lg" && "md:col-span-2 md:row-span-2",
                feature.size === "md" && index === 1 && "md:row-span-2"
              )}
              href={feature.href}
              key={feature.id}
            >
              <Image
                alt={feature.title}
                className="z-0 touch-none select-none object-cover"
                fill
                priority
                src={feature.image}
              />
              <div className="absolute inset-0 z-10 flex h-full flex-col justify-between p-4 md:p-6">
                <div className="space-y-2">
                  <h3
                    className={cn(
                      "font-medium",
                      feature.size === "lg" ? "text-2xl" : "text-xl"
                    )}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}

          {/* Placeholder cards */}
          <div className="relative overflow-hidden rounded-lg border border-dashed bg-background/50 p-6">
            <div className="flex h-full items-center justify-center text-center text-muted-foreground text-sm">
              Ďalšie možnosti čoskoro
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-dashed bg-background/50 p-6">
            <div className="flex h-full items-center justify-center text-center text-muted-foreground text-sm">
              Pracujeme na tom
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
