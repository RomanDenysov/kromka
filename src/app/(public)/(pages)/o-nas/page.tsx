import type { Metadata } from "next";
import Image from "next/image";
import { HomeHeroCta } from "@/app/(public)/_components/home-hero-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { PageSection, SectionHeader } from "@/components/shared/public-page";
import { createMetadata } from "@/lib/metadata";
import { getFAQSchema } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/utils";

const ABOUT_FAQ = [
  {
    question: "Kedy bola Pekáreň Kromka založená?",
    answer:
      "Pekáreň Kromka bola založená v roku 2020. Našu prvú pobočku sme otvorili na ulici 17. novembra v Prešove.",
  },
  {
    question: "Kde nájdem predajne Pekárne Kromka?",
    answer:
      "Naše predajne nájdete v Prešove a v Košiciach. Okrem vlastných pobočiek dodávame pečivo aj do ďalších podnikov v regióne.",
  },
  {
    question: "Aké produkty ponúkate?",
    answer:
      "Ponúkame kváskový chlieb, čerstvé rožky, koláče, pečené buchty a ďalšie pekárenské výrobky. Okrem pečiva u nás nájdete aj lokálne produkty ako smotanové maslo, tvaroh, párky, remeselné pivo a naturálne víno.",
  },
  {
    question: "Používate kvások pri pečení?",
    answer:
      "Áno, kvások je základom našej pekárne. Pečieme tradičné slovenské pekárenské výrobky s dôrazom na kvalitné suroviny a remeselný postup.",
  },
];

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
      <JsonLd data={getFAQSchema(ABOUT_FAQ)} />
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
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 text-center md:gap-8">
            <h1
              className="text-balance font-bold text-5xl text-shadow-2xs text-white tracking-tight md:text-6xl"
              id="nas-pribeh-title"
            >
              Náš príbeh
            </h1>
            <p className="mx-auto max-w-2xl text-balance font-medium text-lg text-shadow-2xs text-white tracking-tight md:text-xl lg:text-2xl">
              Chleba, lákocinky a káva. Tri základné piliere remeselnej pekárne
              Kromka.
            </p>
          </div>
        </div>

        {/* Story Section 1 - Image Right */}
        <section className="grid items-center gap-12 md:grid-cols-2 lg:gap-20">
          <div className="space-y-6">
            <h2 className="text-balance font-bold text-2xl tracking-tight md:text-3xl">
              <span className="font-semibold text-brand italic">
                &ldquo;Láska ku kvásku&rdquo;
              </span>
            </h2>
            <p className="text-pretty text-base text-foreground/70 leading-relaxed md:text-lg">
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
            <p className="text-pretty text-base text-foreground/70 leading-relaxed md:text-lg">
              Pečieme každý deň a naše pečivo už ochutnáte aj v ďalších
              podnikoch – u susedov v Nico caffé či v talianskom bistre Ciao,
              ale aj v rôznych iných podnikoch nielen v Prešove. Svoje pobočky
              sme otvorili aj v Košiciach a najnovšie vám v nich urobíme aj
              kávu.
            </p>
          </div>
        </section>

        <PageSection spacing="lg">
          <p className="mx-auto max-w-3xl text-pretty text-center text-base text-foreground/70 leading-relaxed md:text-lg">
            Stále vymýšľame niečo nové. Z našich žemlí si pripravíte ten
            najlepší burger a okrem pečiva u nás nájdete aj výber rôznych
            lákociniek z lokálnych zdrojov. Ponúkame poctivé párky, smotanové
            maslo, tvaroh, šťastné vajíčka, remeselné pivko či naturálne víno.
            Zastavte sa u nás v Kromke.
          </p>
        </PageSection>

        <PageSection
          className="rounded-xl border border-border border-t"
          spacing="xl"
          tone="muted"
        >
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-8">
            <SectionHeader
              align="center"
              description="Objednajte online alebo si vyberte predajňu v Prešove či Košiciach."
              eyebrow="Ďalší krok"
              title="Chlieb z pece, závin z rúk, káva z lásky"
            />
            <HomeHeroCta animated={false} variant="surface" />
          </div>
        </PageSection>
      </article>
    </PageWrapper>
  );
}
