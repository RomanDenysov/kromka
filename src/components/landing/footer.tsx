import type { Route } from "next";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { Container } from "../shared/container";

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
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-muted">
      <Container className="py-12 md:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link className="flex items-center" href="/">
              <Icons.kromka className="h-8 w-auto" />
            </Link>
            <p className="max-w-xs text-muted-foreground text-sm">
              Kváskové pečivo s láskou a tradíciou od roku 2017
            </p>
          </div>

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
              <li>Email: info@kromka.sk</li>
              <li>Tel: +421 XXX XXX XXX</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="text-center text-muted-foreground text-sm">
            © {currentYear} Kromka. Všetky práva vyhradené.
          </p>
        </div>
      </Container>
    </footer>
  );
}
