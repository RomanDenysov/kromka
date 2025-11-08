"use client";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

export type Item = {
  label: string;
  href: Route;
};

type Props = {
  items: Item[];
};

export function SecondaryNav({ items }: Props) {
  const pathname = usePathname();
  return (
    <nav className="p-2">
      <ul className="scrollbar-hide flex justify-start gap-2 overflow-auto">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              className={cn(
                buttonVariants({
                  variant: pathname === item.href ? "secondary" : "ghost",
                  size: "xs",
                })
              )}
              href={item.href}
              prefetch
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
