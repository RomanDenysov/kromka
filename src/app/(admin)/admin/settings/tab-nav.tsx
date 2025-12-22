"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS: { href: Route; label: string }[] = [
  { href: "/admin/settings", label: "Globálne nastavenia" },
  { href: "/admin/settings/configurations", label: "Konfigurácie" },
  { href: "/admin/settings/permissions", label: "Povolenia užívateľov" },
];

export function TabNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  return (
    <nav>
      <ul className="scrollbar-hide flex flex-row gap-3 overflow-x-auto p-3">
        {TABS.map((tab) => (
          <TabNavItem
            href={tab.href}
            isActive={isActive(tab.href)}
            key={tab.href}
            label={tab.label}
          />
        ))}
      </ul>
    </nav>
  );
}

function TabNavItem({
  href,
  label,
  isActive,
}: {
  href: Route;
  label: string;
  isActive: boolean;
}) {
  return (
    <li
      className={cn(
        "font-medium text-primary/80 text-sm underline-offset-8 hover:text-primary hover:underline",
        isActive && "text-primary underline underline-offset-8"
      )}
    >
      <Link href={href}>{label}</Link>
    </li>
  );
}
