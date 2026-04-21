import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIGNUP_URL =
  "https://www.forms.vexioncards.one/signup/?id=6904a68be39f5e7c3da0b2cd";

export function LoyaltyBanner() {
  return (
    <section className="relative overflow-hidden rounded-md">
      {/* Background image - subtle, covers entire section */}
      <div className="absolute inset-0">
        <Image
          alt=""
          className="object-cover opacity-30"
          fill
          sizes="100vw"
          src="/images/banner_medzi_nami.webp"
        />
        <div className="absolute inset-0 bg-[#191613]/60" />
      </div>

      <div className="relative flex flex-col items-start gap-5 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10 md:py-12">
        <div className="space-y-3">
          <Badge
            className="border-white/20 bg-white/10 text-white/80"
            variant="outline"
          >
            Vernostny program
          </Badge>
          <h2 className="text-balance font-bold text-2xl tracking-tight md:text-3xl">
            Medzi nami
          </h2>
          <p className="max-w-md text-pretty text-sm text-white/60 leading-relaxed md:text-base">
            Za kazdu lakocinku si pripisete vernostne body. Medzi nami sa to
            oplati.
          </p>
        </div>

        <a
          className={cn(
            buttonVariants({ variant: "glass", size: "sm" }),
            "shrink-0"
          )}
          href={SIGNUP_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          Zaregistrovat sa
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </a>
      </div>
    </section>
  );
}
