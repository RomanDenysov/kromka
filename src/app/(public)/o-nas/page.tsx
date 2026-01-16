import type { Metadata } from "next";
import Image from "next/image";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";

export const metadata: Metadata = createMetadata({
  title: "O nás",
  description:
    "Náš príbeh začal v roku 2020 láskou ku kvásku. Pečieme tradičné slovenské pekárenské výrobky s použitím kvalitných surovín v Prešove a Košiciach.",
  canonicalUrl: getSiteUrl("/o-nas"),
  image: "/images/shop.jpg",
});

export default function AboutPage() {
  return (
    <PageWrapper className="pb-20">
      <AppBreadcrumbs items={[{ label: "O nás", href: "/o-nas" }]} />

      <article className="space-y-20 md:space-y-32">
        {/* Hero Section */}

        {/* Main Image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted shadow">
          <Image
            alt="Interiér pekárne Kromka"
            className="absolute inset-0 z-0 object-cover object-bottom"
            fill
            priority
            quality={85}
            sizes="(max-width: 768px) 100vw, 90vw"
            src="/images/shop.jpg"
          />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-8 text-center">
            <h1
              className="font-bold text-4xl text-white tracking-tight md:text-6xl"
              id="nas-pribeh-title"
            >
              Náš príbeh
            </h1>
            <p className="mx-auto max-w-2xl font-medium text-lg text-white/90 md:text-xl">
              Chleba, lákocinky a káva. Tri základné piliere remeselnej pekárne
              Kromka.
            </p>
          </div>
        </div>

        {/* Story Section 1 - Image Right */}
        <section className="grid items-center gap-12 md:grid-cols-2 lg:gap-20">
          <div className="space-y-6">
            <h2 className="font-semibold text-2xl italic md:text-3xl">
              &ldquo;Láska ku kvásku&rdquo;
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Práve to bol dôvod, prečo sme v roku 2020 otvorili našu prvú
              pobočku na ulici 17. novembra v Prešove. Je tam dodnes a naši
              zákazníci k nám pravidelne chodia po svoj kváskový bochník,
              čerstvé rožky, koláče a pečené buchty.
            </p>
          </div>
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-muted shadow">
            <Image
              alt="Remeselná pekáreň Kromka"
              className="object-cover"
              fill
              quality={85}
              sizes="(max-width: 768px) 100vw, 50vw"
              src="/images/wood-logo.jpg"
            />
          </div>
        </section>

        {/* Story Section 2 - Image Left */}
        <section className="grid items-center gap-12 md:grid-cols-2 lg:gap-20">
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-muted shadow">
            <Image
              alt="Kaviarne Kromka"
              className="object-cover"
              fill
              quality={85}
              sizes="(max-width: 768px) 100vw, 50vw"
              src="/images/window.jpg"
            />
          </div>
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Pečieme každý deň a naše pečivo už ochutnáte aj v ďalších
              podnikoch – u susedov v Nico caffé či v talianskom bistre Ciao,
              ale aj v rôznych iných podnikoch nielen v Prešove. Svoje pobočky
              sme otvorili aj v Košiciach a najnovšie vám v nich urobíme aj
              kávu.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="text-center">
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground leading-relaxed md:text-xl">
            Stále vymýšľame niečo nové. Z našich žemlí si pripravíte ten
            najlepší burger a okrem pečiva u nás nájdete aj výber rôznych
            lákociniek z lokálnych zdrojov. Ponúkame poctivé párky, smotanové
            maslo, tvaroh, šťastné vajíčka, remeselné pivko či naturálne víno.
            Zastavte sa u nás v Kromke.
          </p>
        </section>
      </article>
    </PageWrapper>
  );
}
