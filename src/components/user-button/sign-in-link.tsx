"use client";

import { LogInIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";

type Props = {
  mobile?: boolean;
};

export function SignInLink({ mobile = false }: Props) {
  const pathname = usePathname();
  const callbackURL = pathname === "/" ? undefined : pathname;

  return (
    <Link
      className={cn(
        buttonVariants({
          variant: mobile ? "outline" : "ghost",
          size: mobile ? "xl" : "icon-sm",
        })
      )}
      href={{
        pathname: "/prihlasenie",
        query: callbackURL ? { origin: callbackURL } : undefined,
      }}
      prefetch
    >
      <LogInIcon />
      {mobile ? "Prihlásiť sa" : null}
      <span className="sr-only">Prihlásiť sa</span>
    </Link>
  );
}
