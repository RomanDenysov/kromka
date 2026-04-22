import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { PageSection } from "@/components/shared/public-page";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ParallaxScrollImage } from "../motion/parallax-scroll-image";

const BENEFITS = [
  "Vyhodne B2B ceny pre Vašu prevádzku",
  "Osobné riešenia pre Vas a Vaš podnik",
  "Dodávka čerstvého pečiva priamo k Vám",
] as const;

export function B2BCta() {
  return (
    <PageSection className="relative overflow-hidden" spacing="xl" tone="muted">
      <Container className="relative">
        <div className="grid items-start gap-10 md:grid-cols-5 md:gap-16">
          {/* Text column */}
          <div className="flex flex-col gap-6 md:col-span-3">
            <div className="space-y-4">
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
                Pre kaviarne, reštaurácie a hotely
              </p>
              <h2 className="text-balance font-bold text-3xl tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                Podme do toho
                <br />
                spolu
              </h2>
              <p className="max-w-lg text-pretty text-foreground/60 text-lg leading-relaxed">
                Dodávame čerstvé kvasové pečivo priamo do vašej prevádzky.
                Individualne riešenia pre Vašu prevádzku.
              </p>
            </div>

            {/* Benefits - clean, minimal list */}
            <ul className="flex flex-col gap-2.5">
              {BENEFITS.map((benefit) => (
                <li
                  className="flex items-center gap-3 text-foreground/80 text-sm"
                  key={benefit}
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/10">
                    <Check className="size-3 text-brand" />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            {/* TODO: Conditionally render based on B2B membership:
                - Non-B2B users: show "Poziadat o spolupracu" + "Zistit viac"
                - B2B members (in org): show "Prejst do B2B obchodu" + "Zistit viac"
                Requires checking session org membership (consider client component or Suspense boundary) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                className={cn(buttonVariants({ variant: "brand" }))}
                href="/b2b/apply"
              >
                Požiadať o spoluprácu
                <ArrowRight />
              </Link>
              {/* TODO: Show for B2B org members only
              <Button asChild size="sm" variant="brand">
                <Link href="/b2b/shop">
                  Prejst do B2B obchodu
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button> */}
              <Link
                className={cn(buttonVariants({ variant: "link" }))}
                href="/b2b"
              >
                Zistit viac
              </Link>
            </div>
          </div>

          {/* Image column - hidden on mobile, warm treatment on desktop */}
          <div className="hidden md:col-span-2 md:block">
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-md border bg-muted/30 shadow-sm">
              <ParallaxScrollImage
                alt="B2B spolupraca s Pekarnou Kromka"
                className="aspect-4/5 w-full rounded-md bg-muted/30 shadow-sm"
                imageClassName="object-cover"
                maxShiftPx={96}
                priority
                quality={85}
                scrollOffset={["start start", "end start"]}
                sizes="(max-width: 768px) 100vw, 90vw"
                src="/images/cooperation.jpg"
              />
              {/* Warm overlay at bottom for depth */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </div>
      </Container>
    </PageSection>
  );
}
