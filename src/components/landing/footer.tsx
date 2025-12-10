import { Facebook, Instagram, MailIcon, PhoneIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { POLICY_LINKS } from "@/app/(public)/(policies)/policies-config";
import { Icons } from "../icons";
import { Container } from "../shared/container";
import { buttonVariants } from "../ui/button";

type FooterLinkItem = {
  name: string;
  href: Route;
};

const footerLinks: Record<"company" | "legal", FooterLinkItem[]> = {
  company: [
    { name: "O nás", href: "/o-nas" },
    { name: "E-shop", href: "/e-shop" },
    { name: "Kontakt", href: "/kontakt" },
    { name: "Predajne", href: "/predajne" },
    { name: "Blog", href: "/blog" },
  ],
  legal: Object.values(POLICY_LINKS).map((link) => ({
    name: link.label,
    href: link.href,
  })),
} as const;

export function Footer() {
  return (
    <footer>
      <Container className="flex flex-col gap-5 rounded-md border px-4 py-8 sm:flex-row">
        <div className="size-full flex-1">
          <Icons.logo className="size-12 text-primary" />
        </div>
        <div className="flex-1">
          <div className="row-span-2 space-y-2">
            <h3 className="font-medium text-sm">Navigácia</h3>
            <nav className="flex flex-col gap-2">
              {footerLinks.company.map((link) => (
                <Link
                  className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                  href={link.href}
                  key={link.href}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
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

          {/* Social */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Sledujte nás</h3>
            <div className="flex gap-2">
              <Link
                className={buttonVariants({ variant: "ghost", size: "icon" })}
                href="https://www.instagram.com/pekaren.kromka"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Instagram className="size-4" />
              </Link>
              <Link
                className={buttonVariants({ variant: "ghost", size: "icon" })}
                href="https://www.facebook.com/pekaren.kromka"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Facebook className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
      <Container className="flex flex-col-reverse items-center justify-between gap-2 py-6 sm:flex-row">
        <p className="text-center text-muted-foreground text-xs">
          © 2025, Kromka, s.r.o. Všetky práva vyhradené.
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          {footerLinks.legal.map((link) => (
            <Link
              className="text-muted-foreground text-xs transition-colors hover:text-foreground"
              href={link.href}
              key={link.href}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </Container>
    </footer>
  );
}
