import { MenuIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { Icons } from "@/components/icons";
import { MobileNavigation } from "@/components/mobile-nav";
import { Container } from "@/components/shared/container";
import { Button, buttonVariants } from "@/components/ui/button";
import { featureFlags } from "@/config/features";
import { cn } from "@/lib/utils";

const navigation: { name: string; href: Route }[] = [
  { name: "E-shop", href: "/e-shop" },
  { name: "B2B", href: "/b2b" },
  { name: "Predajne", href: "/predajne" },
  ...(featureFlags.blog ? [{ name: "Blog", href: "/blog" as Route }] : []),
];

export function Header({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <Container>
        <div className="flex h-12 w-full items-center justify-center gap-4 md:grid md:h-14 md:grid-cols-[1fr_auto_1fr] md:gap-5">
          {/* Navigation */}
          <Suspense
            fallback={
              <Button
                className="md:hidden"
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <MenuIcon className="size-5" />
              </Button>
            }
          >
            <MobileNavigation navigation={navigation} />
          </Suspense>
          <nav className="hidden grow items-center justify-start gap-2 md:flex">
            {navigation.map((item) => (
              <Link
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                href={item.href}
                key={item.href}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <div className="flex grow items-center justify-start md:justify-center">
            <Link href="/">
              <Icons.kromka className="h-4 lg:h-5" />
            </Link>
          </div>

          {/* Actions */}
          {children}
        </div>
      </Container>
    </header>
  );
}
