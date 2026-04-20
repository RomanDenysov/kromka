"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS: { href: Route; label: string }[] = [
  { href: "/admin/playground" as Route, label: "Komponenty" },
  { href: "/admin/playground/typography" as Route, label: "Typografia" },
];

export function PlaygroundSubnav() {
  const pathname = usePathname() as string;

  return (
    <nav
      aria-label="Playground navigácia"
      className="flex flex-wrap gap-2 border-b pb-3"
    >
      {LINKS.map((link) => {
        const href = link.href as string;
        const isActive =
          href === "/admin/playground"
            ? pathname === "/admin/playground"
            : pathname === href;
        return (
          <Link
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-accent font-medium text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
