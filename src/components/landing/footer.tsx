"use client";

import { Facebook, Instagram, MailIcon, PhoneIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icons } from "../icons";
import { Container } from "../shared/container";
import { buttonVariants } from "../ui/button";

type FooterLinkItem = {
  name: string;
  href: Route;
};

const footerLinks: Record<"company" | "legal", FooterLinkItem[]> = {
  company: [
    { name: "O nás", href: "/o-nas" as Route },
    { name: "Kontakt", href: "/kontakt" as Route },
    { name: "Predajne", href: "/obchody" as Route },
    { name: "Blog", href: "/blog" as Route },
  ],
  legal: [
    { name: "Podmienky používania", href: "/podmienky-pouzivania" as Route },
    {
      name: "Ochrana osobných údajov",
      href: "/zasady-ochrany-osobnych-udajov" as Route,
    },
  ],
} as const;

export function Footer() {
  return (
    <div
      className="relative h-[550px] sm:h-[650px]"
      style={{ clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0 100%)" }}
    >
      <div className="-top-[100vh] relative h-[calc(100vh+550px)] sm:h-[calc(100vh+650px)]">
        <footer className="sticky top-[calc(100vh-550px)] h-[550px] w-full border-t pt-3 sm:top-[calc(100vh-650px)] sm:h-[650px]">
          <div className="flex size-full flex-col items-center justify-end gap-8 pt-5">
            <div className="w-full shrink-0 px-3">
              <Icons.kromka className="h-full text-primary" />
            </div>
            <Container className="flex h-full flex-col">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                {/* Company links */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm">Spoločnosť</h3>
                  <ul className="space-y-3">
                    {footerLinks.company.map((link) => (
                      <li key={link.href}>
                        <Link
                          className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                          href={link.href}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal links */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm">Právne informácie</h3>
                  <ul className="space-y-3">
                    {footerLinks.legal.map((link) => (
                      <li key={link.href}>
                        <Link
                          className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                          href={link.href}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm">Kontakt</h3>
                  <ul className="space-y-3 text-muted-foreground text-sm">
                    <li>
                      <Link
                        className="flex items-center gap-1"
                        href="mailto:kromka@kavejo.sk"
                      >
                        <MailIcon className="size-4" />
                        kromka@kavejo.sk
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="flex items-center gap-1"
                        href="tel:+421912345678"
                      >
                        <PhoneIcon className="size-4" />
                        +421 912 345 678
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-sm">Sledujte nás</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>
                      <Link
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "xs" })
                        )}
                        href="https://www.instagram.com/pekaren.kromka"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Instagram />
                        Instagram
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "xs" })
                        )}
                        href="https://www.facebook.com/pekaren.kromka"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Facebook />
                        Facebook
                      </Link>
                    </li>
                    <li>
                      <Link
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "xs" })
                        )}
                        href="https://zkromky.substack.com?utm_source=navbar&utm_medium=web"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Icons.substack />
                        Substack
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </Container>
            <div className="mt-auto w-full border-t p-5">
              <div className="flex items-center justify-center gap-2">
                <p className="select-none text-center text-muted-foreground text-xs">
                  © 2025, Kromka, s.r.o. Všetky práva vyhradené.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
