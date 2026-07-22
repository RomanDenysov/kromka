import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { buttonVariants } from "@/components/ui/button";

export function CallToAction() {
  return (
    <section className="w-full border-t bg-muted/30">
      <Container className="py-16 md:py-24">
        <div className="mx-auto flex max-w-200 flex-col items-center gap-6 text-center">
          <h2 className="font-medium text-3xl tracking-tight sm:text-4xl">
            Pripravení začať?
          </h2>
          <p className="max-w-150 text-foreground/60 text-lg">
            Zaregistrujte sa a získajte prístup k exkluzívnym ponukám,
            veľkoobjednávkam a ďalším výhodám pre stálych zákazníkov.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              className={buttonVariants({ size: "sm" })}
              href="/prihlasenie"
            >
              Registrovať sa
              <ArrowRight className="ml-2 size-4" />
            </Link>

            <Link
              className={buttonVariants({ size: "sm", variant: "outline" })}
              href="/o-nas"
            >
              Zistiť viac
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
