import { CheckCircleIcon } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";

export const metadata: Metadata = createMetadata({
  title: "Žiadosť odoslaná",
  description: "Vaša B2B žiadosť bola úspešne odoslaná.",
  canonicalUrl: getSiteUrl("/b2b/apply/success"),
  robots: { index: false, follow: false },
});

export default function B2BApplySuccessPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs
        items={[
          { label: "B2B", href: "/b2b" as Route },
          { label: "Žiadosť o spoluprácu", href: "/b2b/apply" as Route },
          { label: "Úspech" },
        ]}
      />

      <section className="mx-auto w-full max-w-2xl py-12 md:py-20">
        <Card>
          <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircleIcon className="size-8 text-success" />
            </div>
            <div className="space-y-2">
              <h1 className="font-bold text-2xl md:text-3xl">
                Žiadosť bola odoslaná
              </h1>
              <p className="text-lg text-muted-foreground">
                Ďakujeme za váš záujem o B2B spoluprácu. Naša tím preverí vašu
                žiadosť a ozve sa vám do 2 pracovných dní na email, ktorý ste
                uvedli.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild>
                <Link href="/b2b">Späť na B2B</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Na hlavnú stránku</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </PageWrapper>
  );
}
