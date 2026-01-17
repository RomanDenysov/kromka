import type { Metadata, Route } from "next";
import { Suspense } from "react";
import { B2BApplicationForm } from "@/components/forms/b2b-application-form";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";

export const metadata: Metadata = createMetadata({
  title: "B2B Žiadosť o spoluprácu",
  description:
    "Vyplňte formulár pre B2B spoluprácu s Pekárňou Kromka. Pošleme vám informácie o výhodných cenách a podmienkach.",
  canonicalUrl: getSiteUrl("/b2b/apply"),
  robots: { index: false, follow: false },
});

function B2BApplicationFormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

export default function B2BApplyPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs
        items={[
          { label: "B2B", href: "/b2b" as Route },
          { label: "Žiadosť o spoluprácu", href: "/b2b/apply" as Route },
        ]}
      />

      <section className="mx-auto w-full max-w-3xl py-8 md:py-12">
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl md:text-4xl">
            B2B Žiadosť o spoluprácu
          </h1>
          <p className="text-lg text-muted-foreground">
            Vyplňte formulár a my sa vám ozveme do 2 pracovných dní s
            informáciami o B2B spolupráci.
          </p>
        </div>

        <Suspense fallback={<B2BApplicationFormSkeleton />}>
          <B2BApplicationForm />
        </Suspense>
      </section>
    </PageWrapper>
  );
}
