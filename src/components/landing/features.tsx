import {
  Building2,
  Handshake,
  type LucideIcon,
  Newspaper,
  ShoppingBag,
  Store,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { featureFlags } from "@/config/features";
import { cn } from "@/lib/utils";
import { Container } from "../shared/container";

type FeatureCard = {
  id: keyof typeof featureFlags;
  title: string;
  description: string;
  href: Route;
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
};

const features: FeatureCard[] = [
  {
    id: "eshop",
    title: "E-shop",
    description: "Objednajte si naše pečivo online s doručením až domov",
    href: "/eshop" as Route,
    icon: ShoppingBag,
    size: "lg",
  },
  {
    id: "b2b",
    title: "B2B",
    description: "Veľkoodber pre firmy a podnikateľov",
    href: "/b2b" as Route,
    icon: Building2,
    size: "md",
  },
  {
    id: "partnership",
    title: "Partnerstvo",
    description: "Predávajte svoje výrobky cez našu sieť",
    href: "/partnerstvo" as Route,
    icon: Handshake,
    size: "md",
  },
  {
    id: "stores",
    title: "Predajne",
    description: "Nájdite najbližšiu predajňu Kromka",
    href: "/obchody" as Route,
    icon: Store,
    size: "md",
  },
  {
    id: "blog",
    title: "Blog",
    description: "Články, tipy a recepty zo sveta pečenia",
    href: "/blog" as Route,
    icon: Newspaper,
    size: "md",
  },
];

export function Features() {
  const visibleFeatures = features.filter(
    (feature) => featureFlags[feature.id]
  );

  return (
    <section className="w-full border-t bg-muted/30">
      <Container className="py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="font-medium text-3xl tracking-tight sm:text-4xl">
            Čo vám ponúkame
          </h2>
          <p className="mt-4 text-muted-foreground">
            Objavte všetky služby a možnosti, ktoré pre vás máme pripravené
          </p>
        </div>

        <div className="grid auto-rows-[200px] grid-cols-1 gap-4 md:grid-cols-3">
          {visibleFeatures.map((feature, index) => (
            <Link
              className={cn(
                "group relative overflow-hidden rounded-lg border bg-background p-6 transition-all hover:border-primary hover:shadow-sm",
                feature.size === "lg" && "md:col-span-2 md:row-span-2",
                feature.size === "md" && index === 1 && "md:row-span-2"
              )}
              href={feature.href}
              key={feature.id}
            >
              <div className="flex h-full flex-col justify-between">
                <div
                  className={cn(
                    "transition-transform group-hover:scale-110",
                    feature.size === "lg" ? "size-12" : "size-10"
                  )}
                >
                  <feature.icon className="size-5" />
                </div>
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
