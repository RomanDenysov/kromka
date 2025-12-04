"use client";

import {
  LogInIcon,
  LogOutIcon,
  PackageIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/client";
import type { User } from "@/lib/auth/session";
import { cn, getInitials } from "@/lib/utils";

export function MobileUserButton({ user }: { user?: User }) {
  const pathname = usePathname();
  const callbackURL = pathname === "/" ? undefined : pathname;
  const router = useRouter();

  if (!user || user?.isAnonymous) {
    return (
      <Link
        className={cn(
          buttonVariants({ variant: "outline", size: "xl" }),
          "w-full"
        )}
        href={{
          pathname: "/prihlasenie",
          query: callbackURL ? { origin: callbackURL } : undefined,
        }}
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
