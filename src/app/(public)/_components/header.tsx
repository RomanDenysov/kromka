import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { Icons } from "@/components/icons";
import { MobileNavigation } from "@/components/mobile-nav";
import { Container } from "@/components/shared/container";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navigation } from "./navigation";

export function Header({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "w-full border-b bg-background pt-[env(safe-area-inset-top)]",
        className
      )}
      data-layout-header
    >
      <Container>
        <div className="grid h-12 w-full grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-5">
          {/* Navigation */}
          <Suspense
            fallback={
              <Button
                aria-label="Otvoriť menu"
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
                className={buttonVariants({ variant: "ghost", size: "sm" })}
                href={item.href}
                key={item.href}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <Link className="flex items-center justify-center" href="/">
            <Icons.kromka className="h-4 lg:h-5" />
          </Link>

          {/* Actions */}
          {children}
        </div>
      </Container>
    </header>
  );
}
