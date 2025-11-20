"use client";

import {
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  PackageIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { signOut } from "@/lib/auth/client";
import { cn, getInitials } from "@/lib/utils";
import type { User } from "@/types/users";

type Props = {
  navigation: { name: string; href: Route }[];
  user: User | null;
};

export function MobileNavigation({ navigation, user }: Props) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <Drawer direction="left">
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
      <DrawerContent>
        <DrawerHeader className="text-center md:text-center">
          <DrawerTitle className="flex items-center justify-center gap-2">
            <Icons.kromka className="h-4 lg:h-5" />
            <span className="sr-only">Kromka Logo</span>
          </DrawerTitle>
        </DrawerHeader>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-3">
            {navigation.map((item) => (
              <Link
                className={cn(
                  buttonVariants({ variant: "secondary", size: "xl" })
                )}
                href={item.href}
                key={item.href}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <DrawerFooter>
          <MobileUserButton user={user} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function MobileUserButton({ user }: { user: User | null }) {
  const router = useRouter();
  if (!user) {
    return (
      <Link
        className={cn(
          buttonVariants({ variant: "outline", size: "xl" }),
          "w-full"
        )}
        href="/prihlasenie"
      >
        <LogInIcon />
        Prihlásiť sa
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="w-full justify-start p-2"
          size="xl"
          variant="outline"
        >
          <Avatar className="relative size-8 rounded-md">
            <AvatarImage
              className="rounded-md object-cover"
              src={user.image ?? undefined}
            />
            <AvatarFallback className="rounded-md" delayMs={300}>
              {getInitials(user.name || user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="truncate text-balance text-left font-medium text-sm leading-none">
              {user.name}
            </span>
            <span
              className={cn(
                "truncate text-balance text-left text-muted-foreground text-xs",
                !user.name && "text-primary"
              )}
            >
              {user.email}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
        <DropdownMenuItem asChild>
          <Link href="/profil">
            <UserIcon />
            Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profil/nastavenia">
            <SettingsIcon />
            Nastavenia
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profil/objednavky">
            <PackageIcon />
            Objednavky
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin">
            <Icons.logo className="size-4" />
            Admin panel
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/");
                },
                onError: () => {
                  toast.error("Odhlásenie sa nepodarilo");
                },
              },
            })
          }
        >
          <LogOutIcon />
          Odhlásiť sa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
