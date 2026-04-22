import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";

export async function RegistrationBanner() {
  const session = await getSession();

  if (session) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-md border bg-background px-6 py-5 shadow-sm sm:flex-row sm:gap-6">
      <p className="text-pretty text-base text-foreground/70">
        <span className="font-semibold text-foreground">Registrujte sa</span> a
        ziskajte oblubene produkty, pravidelne objednavky a spravu nakupov
      </p>
      <Link
        className="group inline-flex shrink-0 items-center gap-2 font-semibold text-base text-brand transition-colors hover:text-brand/80"
        href="/prihlasenie"
      >
        Vytvorit ucet
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}
