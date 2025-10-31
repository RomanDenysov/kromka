import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MagicLinkForm } from "./magic-link-form";
import { ProvidersForm } from "./providers-form";

const POLICY_LINKS = {
  podmienkyPouzivania: "/podmienky-pouzivania" as Route,
  zasadyOchranySukromia: "/zasady-ochrany-osobnych-udajov" as Route,
} as const;

export function LoginView({
  callbackURL,
  className,
}: {
  callbackURL: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-xs space-y-4 p-4",
        // "rounded-lg border border-border bg-background/50 shadow saturate-150 backdrop-blur-sm",
        className
      )}
    >
      <div className="text-center">
        <h1 className="font-semibold text-2xl">Prihlásenie</h1>
        <p className="text-muted-foreground text-sm">
          Prihláste sa do svojho účtu pre prístup ku Kromka učtu.
        </p>
      </div>
      <ProvidersForm callbackURL={callbackURL} />
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          alebo
        </span>
      </div>

      <MagicLinkForm />

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
  );
}
