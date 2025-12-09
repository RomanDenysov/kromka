import { Suspense } from "react";
import { SupportForm } from "@/components/forms/support-form";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";

export default function SupportPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs
        items={[{ label: "Kontakt", href: "/kontakt" }, { label: "Podpora" }]}
      />

      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="font-bold text-3xl md:text-4xl">Kontaktný formulár</h1>

        <Suspense>
          <SupportForm />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
