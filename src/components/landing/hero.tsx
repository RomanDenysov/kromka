import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Container } from "../shared/container";

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] w-full items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          alt="Čerstvé kváskovanie pečivo a koláče"
          className="object-cover"
          fill
          priority
          src="/images/sortiment.jpg"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            className="mb-6 bg-white/90 text-foreground backdrop-blur-sm"
            variant="secondary"
          >
            Sme otvorené!
          </Badge>

          <h1 className="mb-6 font-medium text-5xl text-white tracking-tight sm:text-6xl lg:text-7xl">
            S láskou ku kvásku
          </h1>

          <p className="mx-auto mb-8 max-w-[600px] text-lg text-white/90 sm:text-xl">
            V Kromke to vonia čerstvým kváskovým chlebom, koláčmi a kávou, a
            teraz sme aj online! Vitajte na našom eshope, veríme, že si nájdete
            lakocinky podľa svojej chuti.
          </p>
        </div>
      </Container>
    </section>
  );
}
