import type { Metadata } from "next";
import { Suspense } from "react";
import { B2BForm } from "@/components/forms/b2b-form";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";

export const metadata: Metadata = createMetadata({
  title: "B2B Spolupráca",
  description:
    "Záujem o spoluprácu s Pekárňou Kromka? Ponúkame B2B riešenia pre kaviarne, reštaurácie a obchody. Vyplňte registračný formulár.",
  canonicalUrl: getSiteUrl("/b2b"),
});

export default function B2BPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "B2B", href: "/b2b" }]} />
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-5 py-20 md:flex-row">
        <div className="flex size-full flex-col items-start justify-center gap-5">
          <h2 className="font-bold text-3xl md:text-5xl">B2B - Registrácia</h2>
          <p className="text-balance text-lg text-muted-foreground md:text-xl">
            Ak ste zákazník, ktorý by chcel spolupracovať s nami,
            <br />
            vyplňte zadaný formulár a my sa vám ozveme.
          </p>
        </div>

        <Card className="w-full max-w-md shrink">
          <CardHeader>
            <CardTitle>B2B - Registrácia</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense>
              <B2BForm />
            </Suspense>
          </CardContent>
        </Card>
      </section>
    </PageWrapper>
  );
}
