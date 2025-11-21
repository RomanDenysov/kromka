"use client";

import type { RouterOutputs } from "@/trpc/routers";
import { ProductImage } from "../shared/product-image";

const _MAX_CATEGORIES_DISPLAY = 3;

const _CENTS_PER_UNIT = 100;

type Props = {
  product: RouterOutputs["public"]["products"]["list"][number];
};

export function ProductCard({ product }: Props) {
  return (
    <div className="relative overflow-hidden rounded-sm">
      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
      <ProductImage
        alt={product.name}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        src={product.images[0]}
      />
      <div className="absolute right-0 bottom-0 left-0 p-4">
        <h3 className="font-bold text-lg">{product.name}</h3>
      </div>
    </div>
  );
}
