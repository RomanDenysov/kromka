import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { homepageConfig } from "@/config/homepage";
import { cn } from "@/lib/utils";
import { Container } from "../shared/container";
import { buttonVariants } from "../ui/button";

export function Hero() {
  const { main, cta } = homepageConfig.hero;

  return (
    <section className="flex h-[calc(100vh-4rem)] py-5">
      <Container className="grid grid-cols-1 gap-6 md:grid-cols-5 lg:grid-cols-7">
        <article
          className={cn(
            "relative flex-1 overflow-hidden rounded-md shadow-md",
            "md:col-span-3 lg:col-span-4"
          )}
        >
          <div className="absolute inset-0 z-10 flex flex-col items-start justify-end gap-6 p-4 md:p-6">
            <Badge variant="secondary">
              <span className="size-3 rounded-full bg-green-500" />
              Sme otvorené!
            </Badge>

            <h1 className="font-bold text-5xl text-white tracking-tight sm:text-6xl lg:text-7xl">
              {main.title}
            </h1>

            <p className="mb-8 max-w-[600px] text-lg text-white sm:text-xl">
              {main.description}
            </p>
          </div>

          <Image
            alt="Čerstvé kváskovanie pečivo a koláče"
            className="touch-none select-none object-cover"
            fill
            priority
            src={main.image}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/25 via-black/25 to-transparent" />
        </article>
        <CallToActionBanner
          className="md:col-span-2 lg:col-span-3"
          image={cta.image}
          link={cta.link}
        />
      </Container>
    </section>
  );
}

function CallToActionBanner({
  className,
  image,
  link,
}: {
  className?: string;
  image: string;
  link?: { label: string; href: Route };
}) {
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
        src={image}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/25 via-black/25 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-end p-4 md:p-6">
        <Link
          className={cn(
            buttonVariants({ variant: "secondary", size: "xl" }),
            "w-full font-medium text-lg"
          )}
          href={link?.href ?? "/"}
        >
          {link?.label}
        </Link>
      </div>
    </article>
  );
}
