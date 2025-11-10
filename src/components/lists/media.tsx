"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useMemo } from "react";
import { useTRPC } from "@/trpc/client";
import { ProductImageUpload } from "../forms/products/product-image-upload";
import { AspectRatio } from "../ui/aspect-ratio";

export function MediaList() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.admin.media.list.queryOptions());

  const processedMedia = useMemo(() => data ?? [], [data]);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
      {processedMedia.map((media) => (
        <div
          className="relative aspect-square overflow-hidden rounded-md bg-muted"
          key={media.id}
        >
          <AspectRatio ratio={1}>
            <Image
              alt={media.name}
              className="object-cover"
              height={160}
              src={media.path}
              width={160}
            />
          </AspectRatio>
        </div>
      ))}
      <ProductImageUpload productId="1" />
    </div>
  );
}
