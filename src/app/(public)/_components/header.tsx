import { ShoppingCartIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CartDrawer } from "@/components/drawers/cart-drawer";
import { Icons } from "@/components/icons";
import { UserButton } from "@/components/landing/user-button";
import { Container } from "@/components/shared/container";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { MobileNavigation } from "./mobile-navigation";

const navigation: { name: string; href: Route }[] = [
  { name: "Eshop", href: "/eshop" },
  { name: "B2B", href: "/b2b" },
  { name: "Predajne", href: "/predajne" },
  { name: "Blog", href: "/blog" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <Container>
        <div className="flex h-14 w-full items-center justify-center gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-5">
          <Suspense fallback={<Skeleton className="size-8 rounded-md" />}>
            <MobileNavigation navigation={navigation} />
          </Suspense>
          {/* Navigation */}
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
          <div className="flex items-center justify-end gap-3">
            <Suspense
              fallback={
                <Skeleton className="hidden size-8 rounded-md md:block" />
              }
            >
              <UserButton />
            </Suspense>
            <Suspense
              fallback={
                <Button
                  className="relative"
                  disabled
                  size="icon-sm"
                  variant="ghost"
                >
                  <ShoppingCartIcon className="size-5" />
                  <span className="sr-only">Košík</span>
                </Button>
              }
            >
              <CartDrawer />
            </Suspense>
          </div>
        </div>
      </Container>
    </header>
  );
}
