import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Container } from "../shared/container";
import { buttonVariants } from "../ui/button";

export function Hero() {
  return (
    <section className="flex h-[calc(100vh-4rem)] py-5">
      <Container className="grid grid-cols-1 gap-6 md:grid-cols-5 lg:grid-cols-7">
        <article
          className={cn(
            "relative flex-1 overflow-hidden rounded-md shadow-md",
            "md:col-span-3 lg:col-span-4"
          )}
        >
          <div className="absolute inset-0 flex flex-col items-start justify-end gap-6 p-4 md:p-6">
            <Badge variant="outline">
              <span className="size-3 rounded-full bg-green-500" />
              Sme otvorené!
            </Badge>

            <h1 className="font-bold text-5xl tracking-tight sm:text-6xl lg:text-7xl">
              S láskou ku kvásku
            </h1>

            <p className="mb-8 max-w-[600px] text-lg sm:text-xl">
              V Kromke to vonia čerstvým kváskovým chlebom, koláčmi a kávou, a
              teraz sme aj online! Vitajte na našom eshope, veríme, že si
              nájdete lakocinky podľa svojej chuti.
            </p>
          </div>
        </article>
        <CallToActionBanner className="md:col-span-2 lg:col-span-3" />
      </Container>
    </section>
  );
}

function CallToActionBanner({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        "relative h-full overflow-hidden rounded-md shadow-md",
        className
      )}
    >
      <Image
        alt="Čerstvé kváskovanie pečivo a koláče"
        className="touch-none select-none object-cover"
        fill
        priority
        src="/images/breads.jpg"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/25 via-black/25 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-end p-4 md:p-6">
        <Link
          className={cn(
            buttonVariants({ variant: "secondary", size: "xl" }),
            "w-full font-medium text-lg"
          )}
          href="/eshop"
        >
          Prejsť na eshop
        </Link>
      </div>
    </article>
  );
}
