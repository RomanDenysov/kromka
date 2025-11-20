import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { MagicLinkForm } from "@/app/prihlasenie/magic-link-form";
import { ProvidersForm } from "@/app/prihlasenie/providers-form";
import { BackButton } from "@/components/shared/back-button";
import { Spinner } from "@/components/ui/spinner";
import doorsPhoto from "../../../public/images/doors.jpg";

const POLICY_LINKS = {
  podmienkyPouzivania: "/podmienky-pouzivania" as Route,
  zasadyOchranySukromia: "/zasady-ochrany-osobnych-udajov" as Route,
} as const;

export default function LoginPage() {
  return (
    <div className="relative flex size-full min-h-screen items-center justify-center">
      <BackButton className="absolute top-4 left-4 z-10" />
      <div className="relative hidden size-full h-screen flex-1 md:block">
        <Image
          alt="Doors"
          className="absolute inset-0 size-full object-cover object-center grayscale-[10]"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src={doorsPhoto}
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
              href={POLICY_LINKS.podmienkyPouzivania}
            >
              Podmienkami používania
            </Link>{" "}
            a{" "}
            <Link
              className="text-primary underline"
              href={POLICY_LINKS.zasadyOchranySukromia}
            >
              Zásadami ochrany súkromia
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
