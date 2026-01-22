import {
  ArrowRight,
  BriefcaseIcon,
  CheckCircleIcon,
  FileTextIcon,
} from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { Container, PageWrapper } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";

export const metadata: Metadata = createMetadata({
  title: "B2B Spolupráca",
  description:
    "Ponúkame B2B riešenia pre kaviarne, reštaurácie, hotely a obchody. Výhodné ceny, fakturácia a individuálny prístup. Požiadajte o spoluprácu.",
  canonicalUrl: getSiteUrl("/b2b"),
});

const BENEFITS = [
  {
    icon: BriefcaseIcon,
    title: "Výhodné ceny",
    description: "Špeciálne B2B ceny pre vašu organizáciu",
  },
  {
    icon: FileTextIcon,
    title: "Fakturácia",
    description: "Platba na faktúru s flexibilnými splatnosťami",
  },
  {
    icon: CheckCircleIcon,
    title: "Individuálny prístup",
    description: "Dedikovaná podpora a personalizované riešenia",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Vyplňte žiadosť",
    description: "Pošlite nám informácie o vašej spoločnosti",
  },
  {
    number: "2",
    title: "Schválenie",
    description: "Náš tím preverí vašu žiadosť a ozve sa vám",
  },
  {
    number: "3",
    title: "Objednávajte",
    description: "Začnite objednávať s výhodnými B2B cenami",
  },
  {
    number: "4",
    title: "Fakturujte",
    description: "Platba na faktúru podľa dohodnutých podmienok",
  },
];

export default function B2BPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "B2B", href: "/b2b" }]} />

      {/* Hero Section */}
      <section className="w-full border-b bg-muted/30 py-12 md:py-20">
        <Container>
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            <h1 className="font-bold text-4xl tracking-tight md:text-5xl lg:text-6xl">
              B2B Spolupráca
            </h1>
            <p className="max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
              Dodávame čerstvé pekárenské výrobky pre kaviarne, reštaurácie,
              hotely a obchody. Výhodné ceny, fakturácia a individuálny prístup
              pre vašu organizáciu.
            </p>
            <Button asChild size="lg">
              <Link href={"/b2b/apply" as Route}>
                Požiadať o spoluprácu
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="w-full border-b py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center font-semibold text-2xl md:text-3xl">
              Prečo spolupracovať s nami?
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
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
      </section>

      {/* How it Works Section */}
      <section className="w-full border-b py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center font-semibold text-2xl md:text-3xl">
              Ako to funguje?
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step) => (
                <div
                  className="flex flex-col items-start gap-3 rounded-lg border p-6"
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
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-16">
        <Container>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <h2 className="font-semibold text-2xl md:text-3xl">
              Pripravení začať?
            </h2>
            <p className="text-lg text-muted-foreground">
              Vyplňte jednoduchý formulár a my sa vám ozveme do 2 pracovných
              dní.
            </p>
            <Button asChild size="lg">
              <Link href={"/b2b/apply" as Route}>
                Požiadať o spoluprácu
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </PageWrapper>
  );
}
