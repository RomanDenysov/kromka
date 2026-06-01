import { ArrowRight } from "lucide-react";
import { HomepageCtaLink } from "@/components/analytics/homepage-cta-tracked";
import { getSession } from "@/lib/auth/session";

export async function RegistrationBanner() {
  const session = await getSession();

  if (session) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-md border bg-background px-6 py-5 shadow-sm sm:flex-row sm:gap-6">
      <p className="text-pretty text-base text-foreground/70">
        <span className="font-semibold text-foreground">Vytvorte si účet</span>{" "}
        a objednávajte obľúbené pečivo jedným klikom - obľúbené produkty na
        jednom mieste, história objednávok a rýchle opakovanie nákupu.
      </p>
      <HomepageCtaLink
        className="group inline-flex shrink-0 items-center gap-2 font-semibold text-base text-brand transition-colors hover:text-brand/80"
        cta="create_account"
        href="/prihlasenie"
        section="registration"
      >
        Vytvoriť účet
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-0.5"
        />
      </HomepageCtaLink>
    </div>
  );
}
