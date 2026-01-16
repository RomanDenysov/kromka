import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { POLICY_LINKS } from "@/app/(public)/(policies)/policies-config";
import { MagicLinkForm } from "@/app/prihlasenie/magic-link-form";
import { ProvidersForm } from "@/app/prihlasenie/providers-form";
import { BackButton } from "@/components/shared/back-button";
import { Spinner } from "@/components/ui/spinner";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";

export const metadata: Metadata = createMetadata({
  title: "Prihlásenie",
  description:
    "Prihláste sa do svojho účtu Pekárne Kromka. Sledujte objednávky, uložte obľúbené produkty a nakupujte rýchlejšie.",
  canonicalUrl: getSiteUrl("/prihlasenie"),
});

export default function LoginPage() {
  return (
    <div className="relative flex size-full min-h-screen items-center justify-center">
      <BackButton className="absolute top-4 left-4 z-10" />
      <div className="relative hidden size-full h-screen flex-1 md:block">
        <Image
          alt="Doors"
          className="absolute inset-0 size-full object-cover object-center grayscale-[10]"
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src="/images/doors.jpg"
        />
      </div>
      <div className="flex-1">
        <div className={"mx-auto max-w-xs space-y-4 p-4"}>
          <div className="text-center">
            <h1 className="font-semibold text-2xl">Prihlásenie</h1>
            <p className="text-muted-foreground text-sm">
              Prihláste sa do svojho účtu pre prístup ku Kromka učtu.
            </p>
          </div>
          <Suspense fallback={<Spinner />}>
            <ProvidersForm />
          </Suspense>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              alebo
            </span>
          </div>

          <Suspense fallback={<Spinner />}>
            <MagicLinkForm />
          </Suspense>

          <p className="text-center text-muted-foreground text-xs">
            Kliknutím na pokračovať súhlasíte s našimi
            <br />
            <Link
              className="text-primary underline"
              href={POLICY_LINKS.obchodnePodmienky.href}
            >
              {POLICY_LINKS.obchodnePodmienky.label}
            </Link>{" "}
            a{" "}
            <Link
              className="text-primary underline"
              href={POLICY_LINKS.ochranaOsobnychUdajov.href}
            >
              {POLICY_LINKS.ochranaOsobnychUdajov.label}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
