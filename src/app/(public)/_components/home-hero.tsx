import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroContent {
  ctaHref: string;
  ctaLabel: string;
  heading?: string;
  imageUrl: string;

  subtitle?: string;
}

export function HomeHero({
  contentPromise,
  className,
}: {
  contentPromise: Promise<HeroContent>;
  className?: string;
}) {
  const content = use(contentPromise);

  return (
    <section
      className={cn(
        "relative h-[calc(100dvh-3rem)] w-full overflow-hidden bg-black",
        className
      )}
    >
      <Image
        alt="Cerstvé pecivo z pekárne Kromka"
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src={content.imageUrl}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/10" />

      {/* Subtitle + CTAs */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6 md:gap-8">
        <h1 className="text-balance text-center font-bold text-7xl text-white">
          {content.heading}
        </h1>
        {content.subtitle && (
          <p className="text-white/70 text-xs uppercase tracking-widest md:text-sm">
            {content.subtitle}
          </p>
        )}
        <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:flex-row md:items-center md:justify-center md:gap-4">
          <Link
            className={cn(
              buttonVariants({ variant: "glass", size: "xl" }),
              "group w-full justify-center md:w-auto"
            )}
            href={content.ctaHref as never}
          >
            {content.ctaLabel}
            <ArrowRight className="size-3.5" />
          </Link>
          <Link
            className={cn(
              buttonVariants({ variant: "link", size: "xl" }),
              "group min-h-11 w-full justify-center text-white no-underline transition-colors duration-200 ease-out hover:no-underline active:text-white/90 motion-reduce:duration-0 md:w-auto md:hover:text-white/80"
            )}
            href="/predajne"
          >
            <MapPin className="size-3.5" />
            Naše predajne
          </Link>
        </div>
      </div>
    </section>
  );
}
