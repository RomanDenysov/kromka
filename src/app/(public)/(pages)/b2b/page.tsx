import {
  ArrowRight,
  BriefcaseIcon,
  CheckCircleIcon,
  FileTextIcon,
  TruckIcon,
} from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { Container, PageWrapper } from "@/components/shared/container";
import { PageSection, SectionHeader } from "@/components/shared/public-page";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/lib/metadata";
import { getFAQSchema } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/utils";

const B2B_FAQ = [
  {
    question: "Pre koho je B2B spolupráca určená?",
    answer:
      "B2B spolupráca je určená pre kaviarne, reštaurácie, hotely, obchody a ďalšie podniky, ktoré chcú ponúkať čerstvé pekárenské výrobky od Pekárne Kromka.",
  },
  {
    question: "Ako funguje fakturácia pre B2B zákazníkov?",
    answer:
      "B2B zákazníci platia na faktúru s flexibilnými splatnosťami. Po schválení vašej žiadosti nastavíme fakturačné podmienky podľa vzájomnej dohody.",
  },
  {
    question: "Ako požiadať o B2B spoluprácu?",
    answer:
      "Vyplňte jednoduchý formulár na našej stránke s informáciami o vašej spoločnosti. Náš tím preverí vašu žiadosť a ozve sa vám do 2 pracovných dní.",
  },
  {
    question: "Dodávate pečivo priamo do prevádzky?",
    answer:
      "Áno, pre B2B zákazníkov zabezpečujeme dodávku čerstvého pečiva priamo do vašej prevádzky podľa dohodnutého harmonogramu.",
  },
];

export const metadata: Metadata = createMetadata({
  title: "B2B Spolupráca",
  description:
    "Ponúkame B2B riešenia pre kaviarne, reštaurácie, hotely a obchody. Výhodné ceny, fakturácia a individuálny prístup. Požiadajte o spoluprácu.",
  canonicalUrl: getSiteUrl("/b2b"),
});

const BENEFITS = [
  {
    icon: BriefcaseIcon,
    title: "Veľkoobchodné ceny",
    description: "Špeciálne B2B ceny, ktoré dávajú zmysel pre vašu maržu.",
  },
  {
    icon: TruckIcon,
    title: "Dodávka každé ráno",
    description: "Čerstvé pečivo dovezené priamo k vám podľa harmonogramu.",
  },
  {
    icon: FileTextIcon,
    title: "Platba na faktúru",
    description: "Flexibilné splatnosti a žiadne platby vopred.",
  },
  {
    icon: CheckCircleIcon,
    title: "Individuálny prístup",
    description: "Dedikovaná podpora a riešenia šité na mieru vašej prevádzke.",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Vyplňte žiadosť",
    description: "Pošlite nám informácie o vašej prevádzke.",
  },
  {
    number: "2",
    title: "Ozveme sa vám",
    description: "Náš tím preverí žiadosť do 2 pracovných dní.",
  },
  {
    number: "3",
    title: "Objednávajte",
    description: "Začnite objednávať za výhodné B2B ceny.",
  },
  {
    number: "4",
    title: "Platba na faktúru",
    description: "Fakturujeme podľa dohodnutých podmienok.",
  },
];

function ApplyCta() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Button asChild size="lg">
        <Link href={"/b2b/apply" as Route}>
          Požiadať o spoluprácu
          <ArrowRight className="ml-2 size-4" />
        </Link>
      </Button>
      <span className="text-muted-foreground text-sm">
        Bez záväzku · odpoveď do 2 pracovných dní
      </span>
    </div>
  );
}

export default function B2BPage() {
  return (
    <PageWrapper>
      <JsonLd data={getFAQSchema(B2B_FAQ)} />
      <AppBreadcrumbs items={[{ label: "B2B", href: "/b2b" }]} />

      <PageSection className="border-b" spacing="xl" tone="muted">
        <Container>
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
              B2B spolupráca
            </p>
            <h1 className="text-balance font-bold text-4xl tracking-tight md:text-5xl lg:text-6xl">
              Čerstvé pečivo pre vašu prevádzku
            </h1>
            <p className="max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
              Dodávame kváskové pečivo pre kaviarne, reštaurácie, hotely a
              obchody - výhodné ceny, platba na faktúru a individuálny prístup
              pre vašu organizáciu.
            </p>
            <ApplyCta />
          </div>
        </Container>
      </PageSection>

      <PageSection className="border-b" spacing="md">
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
            <p className="text-balance font-medium text-lg md:text-xl">
              Naše pečivo už podávajú kaviarne a bistrá v Prešove a Košiciach.
            </p>
            <p className="text-muted-foreground text-sm">
              Nico caffé · Ciao · a ďalšie podniky v regióne
            </p>
          </div>
        </Container>
      </PageSection>

      <PageSection className="border-b" spacing="lg">
        <Container>
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              align="center"
              className="mb-8"
              title="Prečo spolupracovať s nami?"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <Card key={benefit.title}>
                    <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                      <Icon className="size-8 text-primary" />
                      <h3 className="font-semibold text-lg">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </Container>
      </PageSection>

      <PageSection className="border-b" spacing="lg">
        <Container>
          <div className="mx-auto max-w-4xl">
            <SectionHeader
              align="center"
              className="mb-8"
              title="Ako to funguje?"
            />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step) => (
                <div
                  className="flex flex-col items-start gap-3 rounded-md border p-6"
                  key={step.number}
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary font-bold text-lg text-primary-foreground">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </PageSection>

      <PageSection className="border-b" spacing="lg">
        <Container>
          <div className="mx-auto max-w-3xl">
            <SectionHeader
              align="center"
              className="mb-8"
              title="Časté otázky"
            />
            <Accordion collapsible type="single">
              {B2B_FAQ.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Container>
      </PageSection>

      <PageSection spacing="lg">
        <Container>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <SectionHeader
              align="center"
              description="Vyplňte jednoduchý formulár a my sa vám ozveme do 2 pracovných dní."
              title="Pripravení začať?"
            />
            <ApplyCta />
          </div>
        </Container>
      </PageSection>
    </PageWrapper>
  );
}
