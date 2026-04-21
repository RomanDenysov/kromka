import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function BrandStorySection() {
  return (
    <div className="space-y-6">
      <Separator />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="max-w-xl space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
            S laskou ku kvasku od 2020
          </p>
          <p className="text-pretty text-foreground/70 text-sm leading-relaxed md:text-base">
            Kvasok, muka, voda a sol. Pecieme kazdy den v Presove a Kosiciach s
            dorazom na kvalitne suroviny a remeselny postup.
          </p>
        </div>
        <Link
          className="group inline-flex shrink-0 items-center gap-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
          href="/o-nas"
        >
          Nas pribeh
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
      <Separator />
    </div>
  );
}
