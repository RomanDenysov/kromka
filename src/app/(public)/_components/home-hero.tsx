import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroContent {
  ctaHref: string;
  ctaLabel: string;
  heading?: string;
  imageUrl: string;
  subtitle?: string;
}

interface HomeHeroProps {
  content: HeroContent;
}

export function HomeHero({ content }: HomeHeroProps) {
  return (
    <section className="relative h-[calc(100dvh-3rem)] w-full overflow-hidden bg-black md:h-[calc(100dvh-3.5rem)]">
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
      <div className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-6 px-6 md:bottom-10 md:gap-8">
        {content.subtitle && (
          <p className="text-white/70 text-xs uppercase tracking-widest md:text-sm">
            {content.subtitle}
          </p>
        )}
        <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:flex-row md:items-center md:justify-center md:gap-4">
          <Link
            className={cn(
              buttonVariants({ variant: "glass" }),
              "group w-full justify-center md:w-auto"
            )}
            href={content.ctaHref as never}
          >
            {content.ctaLabel}
            <ArrowRight className="size-3.5" />
          </Link>
          <Link
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "w-full justify-center text-white/60 no-underline hover:text-white hover:no-underline md:w-auto"
            )}
            href="/predajne"
          >
            <MapPin className="size-3.5" />
            Nase predajne
          </Link>
        </div>
      </div>
    </section>
  );
}
