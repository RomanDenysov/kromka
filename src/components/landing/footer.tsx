import { Facebook, Instagram, MailIcon, PhoneIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import {
  COMPANY_INFO,
  POLICY_LINKS,
} from "@/app/(public)/(policies)/policies-config";
import { AnimatedBackground } from "@/components/motion-primitives/animated-background";
import { cn } from "@/lib/utils";
import { Icons } from "../icons";
import { Container } from "../shared/container";
import { buttonVariants } from "../ui/button";
import { Separator } from "../ui/separator";

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
    { name: "Nahlásiť problém", href: "/kontakt/podpora?ref=footer" as Route },
  ],
  legal: Object.values(POLICY_LINKS).map((link) => ({
    name: link.label,
    href: link.href,
  })),
} as const;

const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/pekaren.kromka",
    icon: Instagram,
    label: "Instagram",
  },
  {
    href: "https://www.facebook.com/pekaren.kromka",
    icon: Facebook,
    label: "Facebook",
  },
  {
    icon: PhoneIcon,
    label: "+421 912 345 678",
    href: "tel:+421912345678" as Route,
  },
  {
    icon: MailIcon,
    label: COMPANY_INFO.email,
    href: `mailto:${COMPANY_INFO.email}` as Route,
  },
] as const;

const NAVIGATION_FIRST_SECTION_COUNT = 3;
const NAVIGATION_SECOND_SECTION_START = 3;

export function Footer() {
  const navigationSections = [
    {
      title: "Navigácia",
      items: footerLinks.company.slice(0, NAVIGATION_FIRST_SECTION_COUNT),
    },
    {
      title: "Služby",
      items: footerLinks.company.slice(NAVIGATION_SECOND_SECTION_START),
    },
  ];

  return (
    <footer className="border-border border-t bg-muted/30">
      <Container className="py-12">
        {/* Main Footer Content */}
        <div className="mb-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand Section */}
          <div className="col-span-2 space-y-4 sm:col-span-1">
            <Link className="inline-block" href="/">
              <Icons.kromka className="h-8" />
            </Link>
            <p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
              Tradičná pekáreň s láskou k chlebu a pečivu. Používame iba tie
              najkvalitnejšie suroviny pre váš požitok.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
                <Link
                  aria-label={label}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-9 w-9 p-0 text-muted-foreground transition-colors hover:text-foreground"
                  )}
                  href={href}
                  key={href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden size-full sm:block" />
          {/* Navigation Sections */}
          {navigationSections.map((section) => (
            <div className="space-y-4" key={section.title}>
              <h3 className="font-semibold text-foreground text-sm tracking-wide">
                {section.title}
              </h3>
              <nav className="space-y-2">
                <AnimatedBackground
                  className="rounded-md"
                  enableHover
                  transition={{
                    type: "spring",
                    bounce: 0.1,
                    duration: 0.2,
                  }}
                >
                  {section.items.map(({ href, name }) => (
                    <Link
                      className="block rounded-md px-3 py-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
                      data-id={href}
                      href={href}
                      key={href}
                    >
                      {name}
                    </Link>
                  ))}
                </AnimatedBackground>
              </nav>
            </div>
          ))}
        </div>

        <Separator className="mb-6" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-4 text-muted-foreground text-sm sm:flex-row">
          <div className="flex items-center gap-0">
            <span>© 2025</span>
            <Icons.kromka className="mx-1 h-3" />
            <span>s.r.o. Všetky práva vyhradené.</span>
          </div>
          <div className="flex items-center gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                className="transition-colors hover:text-foreground"
                href={link.href}
                key={link.href}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
