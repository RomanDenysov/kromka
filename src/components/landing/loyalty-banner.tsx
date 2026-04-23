import { ArrowRight, StarIcon } from "lucide-react";
import { HomepageCtaExternalLink } from "@/components/analytics/homepage-cta-tracked";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ParallaxScrollImage } from "../motion/parallax-scroll-image";

const SIGNUP_URL =
  "https://www.forms.vexioncards.one/signup/?id=6904a68be39f5e7c3da0b2cd";

export function LoyaltyBanner() {
  return (
    <section className="overflow-hidden rounded-md">
      {/* Background image - subtle, covers entire section */}
      <ParallaxScrollImage
        alt="Medzi nami"
        className="group aspect-video w-full bg-muted shadow"
        imageClassName="object-bottom transition-all duration-300 hover:scale-102"
        maxShiftPx={96}
        priority
        quality={85}
        scrollOffset={["start start", "end start"]}
        sizes="(max-width: 768px) 100vw, 90vw"
        src="/images/banner_medzi_nami.webp"
      >
        <div className="relative flex size-full flex-col justify-end gap-3 p-3 md:items-start md:gap-6 md:p-6">
          <div className="space-y-3">
            <Badge size="xs" variant="secondary">
              <StarIcon className="size-3.5 fill-yellow-500 text-yellow-500 group-hover:animate-ping" />
              Vernostny program
            </Badge>
            <h2 className="text-balance font-semibold text-2xl text-shadow-2xs text-white tracking-tight md:text-3xl">
              Medzi nami
            </h2>
            <p className="text-pretty text-secondary text-shadow-2xs text-sm md:max-w-md md:text-base md:leading-relaxed">
              Za každú lakocinku si pripíšete vernostné body. <br />
              Medzi nami sa to oplatí.
            </p>
          </div>

          <HomepageCtaExternalLink
            className={cn(
              buttonVariants({ variant: "glass", size: "sm" }),
              "shrink-0"
            )}
            cta="loyalty_signup"
            href={SIGNUP_URL}
            rel="noopener noreferrer"
            section="loyalty_banner"
            target="_blank"
          >
            Registrovať sa
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </HomepageCtaExternalLink>
        </div>
      </ParallaxScrollImage>
    </section>
  );
}
