import Image from "next/image";
import { cn } from "@/lib/utils";
import { CardContent } from "./card-content";
import { CardWrapper } from "./card-wrapper";
import { GridCardCarousel } from "./grid-card-carousel";
import type { GridCardProps } from "./types";
import { getCardSizeClasses, getImageSizes } from "./utils";

export function GridCard({
  title,
  subtitle,
  href,
  image,
  images,
  color,
  size = "medium",
  className,
  textColor,
  autoplay = true,
  autoplayDelay = 3000,
}: GridCardProps) {
  const allImages = images || (image ? [image] : []);
  const hasCarousel = allImages.length > 1;
  const hasImage = allImages.length > 0;
  const hasSolidColor = !!color && !hasImage;

  // Delegate to client component only for carousels
  if (hasCarousel) {
    return (
      <GridCardCarousel
        autoplay={autoplay}
        autoplayDelay={autoplayDelay}
        className={className}
        href={href}
        images={allImages}
        size={size}
        subtitle={subtitle}
        textColor={textColor}
        title={title}
      />
    );
  }

  // Server-rendered static card
  return (
    <CardWrapper
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg transition-transform",
        getCardSizeClasses(size),
        className
      )}
      href={href}
    >
      {/* Single image background */}
      {hasImage && (
        <>
          <Image
            alt={title}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            fill
            sizes={getImageSizes(size)}
            src={allImages[0]}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        </>
      )}

      {/* Solid color background */}
      {hasSolidColor && <div className={cn("absolute inset-0", color)} />}

      {/* Content */}
      <CardContent
        hasImage={hasImage}
        href={href}
        size={size}
        subtitle={subtitle}
        textColor={textColor}
        title={title}
      />
    </CardWrapper>
  );
}
