import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Container } from "../shared/container";
import { buttonVariants } from "../ui/button";

export function Hero() {
  return (
    <section className="flex h-[calc(100vh-4rem)] py-5">
      <Container className="flex">
        <div className="flex flex-1 flex-col items-start justify-center gap-6">
          <Badge variant="outline">Sme otvorené!</Badge>

          <h1 className="font-medium text-5xl tracking-tight sm:text-6xl lg:text-7xl">
            S láskou ku kvásku
          </h1>

          <p className="mb-8 max-w-[600px] text-lg sm:text-xl">
            V Kromke to vonia čerstvým kváskovým chlebom, koláčmi a kávou, a
            teraz sme aj online! Vitajte na našom eshope, veríme, že si nájdete
            lakocinky podľa svojej chuti.
          </p>
        </div>
        <CallToActionBanner />
      </Container>
    </section>
  );
}

function CallToActionBanner() {
  return (
    <div className="relative h-full min-w-md overflow-hidden rounded-md bg-muted text-primary-foreground shadow-md">
      <Image
        alt="Čerstvé kváskovanie pečivo a koláče"
        className="touch-none select-none object-cover"
        fill
        priority
        src="/images/breads.jpg"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/25 via-black/25 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-end p-4">
        <Link
          className={cn(
            buttonVariants({ variant: "secondary", size: "lg" }),
            "w-full text-base"
          )}
          href="/eshop"
        >
          Nakupovať
        </Link>
      </div>
    </div>
  );
}
