import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CartDrawer } from "@/components/drawers/cart-drawer";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { UserButton } from "../../../components/landing/user-button";
import { Container } from "../../../components/shared/container";
import { buttonVariants } from "../../../components/ui/button";

const navigation = [
  { name: "Eshop", href: "/eshop" as Route },
  { name: "B2B", href: "/b2b" as Route },
  { name: "Obchody", href: "/obchody" as Route },
  { name: "Blog", href: "/blog" as Route },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <Container className={cn()}>
        <div className="flex h-12 items-center justify-between gap-5">
          {/* Logo */}
          <Link className="flex items-center" href="/">
            <Icons.kromka className="h-4 lg:h-5" />
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center justify-center gap-2 md:flex">
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

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Suspense>
              <UserButton />
            </Suspense>
            <CartDrawer />
          </div>
        </div>
      </Container>
    </header>
  );
}
