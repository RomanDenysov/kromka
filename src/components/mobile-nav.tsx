"use client";

import {
  Facebook,
  Instagram,
  LogOutIcon,
  MailIcon,
  MenuIcon,
  PhoneIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { COMPANY_INFO } from "@/app/(public)/(pages)/(policies)/policies-config";
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
import { signOut, useSession } from "@/lib/auth/client";
import { cn, getInitials } from "@/lib/utils";

interface Props {
  navigation: { name: string; href: Route }[];
}

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

const USER_LINKS: { name: string; href: Route }[] = [
  { name: "Obľúbené", href: "/profil/oblubene" },
  { name: "Objednávky", href: "/profil/objednavky" },
  { name: "Nastavenia profilu", href: "/profil" },
];

export function MobileNavigation({ navigation }: Props) {
  const session = useSession();
  const user = session.data?.user;
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const callbackURL = pathname === "/" ? undefined : pathname;

  const isActive = (href: string) =>
    href === "/profil" ? pathname === "/profil" : pathname.startsWith(href);

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
            <div className="flex items-center gap-3">
              <Avatar className="size-10 rounded-full">
                <AvatarImage
                  className="object-cover"
                  src={user.image ?? undefined}
                />
                <AvatarFallback className="rounded-full font-medium text-sm">
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
          ) : (
            <div className="flex items-center gap-2">
              <Icons.logo className="h-5" />
              <span className="font-bold text-lg">Kromka</span>
            </div>
          )}
        </DrawerHeader>

        <div className="border-t" />

        <div className="flex grow flex-col overflow-y-auto px-6 py-6">
          {/* Main navigation */}
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                className={cn(
                  "py-3 font-semibold text-lg transition-colors",
                  isActive(item.href) ? "text-brand" : "text-foreground"
                )}
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {user && (
            <>
              <div className="my-5 border-t" />
              <nav className="flex flex-col gap-1">
                {USER_LINKS.map((item) => (
                  <Link
                    className={cn(
                      "py-3 font-semibold text-lg transition-colors",
                      isActive(item.href)
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                    href={item.href}
                    key={item.href}
                    onClick={() => setOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </>
          )}

          {!user && (
            <>
              <div className="my-5 border-t" />
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
            </>
          )}
        </div>

        <div className="mt-auto px-6 pb-6">
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
