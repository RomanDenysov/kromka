// TODO: B2B checkout - re-enable when needed
import { ChevronLeftIcon, ClockIcon } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const metadata: Metadata = {
  title: "B2B Pokladňa",
  description: "Dokončite vašu B2B objednávku v Pekárni Kromka.",
  robots: { index: false, follow: false },
};

export default function B2bCheckoutPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs
        items={[
          { label: "B2B E-shop", href: "/b2b/shop" as Route },
          { label: "Pokladňa", href: "/b2b/pokladna" as Route },
        ]}
      />

      <div className="flex w-full items-center justify-center py-20">
        <Empty className="flex flex-col gap-4">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClockIcon />
            </EmptyMedia>
            <EmptyTitle className="lg:text-2xl">
              B2B objednávky budú čoskoro dostupné.
            </EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <p className="text-muted-foreground">
              Pracujeme na vylepšení B2B objednávkového systému.
            </p>
            <Link className={buttonVariants()} href={"/b2b/shop" as Route}>
              <ChevronLeftIcon />
              Späť do e-shopu
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    </PageWrapper>
  );
}
