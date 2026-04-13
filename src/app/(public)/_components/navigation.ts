import type { Route } from "next";
import { featureFlags } from "@/config/features";

export const navigation: { name: string; href: Route }[] = [
  { name: "E-shop", href: "/e-shop" },
  { name: "B2B", href: "/b2b" },
  { name: "Predajne", href: "/predajne" },
  ...(featureFlags.blog ? [{ name: "Blog", href: "/blog" as Route }] : []),
];
