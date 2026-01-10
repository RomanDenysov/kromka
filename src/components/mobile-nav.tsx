"use client";

import {
  BriefcaseIcon,
  Facebook,
  HeartIcon,
  Instagram,
  LogOutIcon,
  MailIcon,
  MenuIcon,
  PackageIcon,
  PhoneIcon,
  SettingsIcon,
  ShoppingBagIcon,
  StoreIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { COMPANY_INFO } from "@/app/(public)/(policies)/policies-config";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { signOut, useSession } from "@/features/auth/client";
import { cn, getInitials } from "@/lib/utils";

type Props = {
  navigation: { name: string; href: Route }[];
  children: ReactNode;
};

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

export function MobileNavigation({ navigation, children }: Props) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const callbackURL = pathname === "/" ? undefined : pathname;

  const user = session?.user;

  const getIconForRoute = (href: string) => {
    if (href.includes("/e-shop")) {
      return ShoppingBagIcon;
    }
    if (href.includes("/b2b")) {
      return BriefcaseIcon;
    }
    if (href.includes("/predajne")) {
      return StoreIcon;
    }
    return Icons.kromka; // Fallback
  };

  return (
    <Drawer direction="left" onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button
          aria-label="Otvoriť menu"
          className="md:hidden"
          size="icon-sm"
          variant="ghost"
        >
          <MenuIcon className="size-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full rounded-none border-r sm:max-w-xs">
        <DrawerHeader className="text-left">
          <DrawerTitle className="sr-only">Navigácia</DrawerTitle>

          {user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-12 rounded-md">
                  <AvatarImage
                    className="object-cover"
                    src={user.image ?? undefined}
                  />
                  <AvatarFallback className="rounded-md font-medium text-lg">
                    {getInitials(user.name || user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-semibold text-sm">
                    {user.name}
                  </span>
                  <span className="truncate text-muted-foreground text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
              <Link
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full justify-start gap-2"
                )}
                href="/profil"
                onClick={() => setOpen(false)}
              >
                <SettingsIcon className="size-4" />
                Nastavenia profilu
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2">
                <Icons.logo className="h-5" />
                <span className="font-bold text-lg">Kromka</span>
              </div>
              <Link
                className={cn(buttonVariants({ size: "sm" }), "w-full")}
                href={{
                  pathname: "/prihlasenie",
                  query: callbackURL ? { origin: callbackURL } : undefined,
                }}
                onClick={() => setOpen(false)}
              >
                Prihlásiť sa
              </Link>
            </div>
          )}
        </DrawerHeader>

        <Separator />

        <div className="flex grow flex-col overflow-y-auto p-4">
          <nav className="flex flex-col gap-2">
            {navigation.map((item) => {
              const Icon = getIconForRoute(item.href);
              return (
                <Link
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "justify-start gap-3 text-base"
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="size-5" />
                  {item.name}
                </Link>
              );
            })}

            {user && (
              <>
                <Separator className="my-2" />
                <Link
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "justify-start gap-3 text-base"
                  )}
                  href="/profil/oblubene"
                  onClick={() => setOpen(false)}
                >
                  <HeartIcon className="size-5" />
                  Obľúbené
                </Link>
                <Link
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "justify-start gap-3 text-base"
                  )}
                  href="/profil/objednavky"
                  onClick={() => setOpen(false)}
                >
                  <PackageIcon className="size-5" />
                  Objednávky
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="mb-4">{children}</div>

          <div className="flex items-center justify-between gap-2 border-t pt-4">
            <div className="flex gap-1">
              {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
                <Link
                  aria-label={label}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon-sm" }),
                    "text-muted-foreground hover:text-foreground"
                  )}
                  href={href}
                  key={href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon className="size-4" />
                </Link>
              ))}
            </div>

            {user && (
              <Button
                onClick={() =>
                  signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        setOpen(false);
                        router.push("/");
                        router.refresh();
                      },
                      onError: () => {
                        toast.error("Odhlásenie sa nepodarilo");
                      },
                    },
                  })
                }
                size="icon-sm"
                variant="ghost"
              >
                <LogOutIcon className="size-4" />
                <span className="sr-only">Odhlásiť sa</span>
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
