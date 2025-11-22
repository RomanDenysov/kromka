"use client";

import {
  LogInIcon,
  LogOutIcon,
  PackageIcon,
  SettingsIcon,
  Store,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetUser } from "@/hooks/use-get-user";
import { signOut } from "@/lib/auth/client";
import { cn, getInitials } from "@/lib/utils";
import { Icons } from "../icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";

export function UserButton() {
  const pathname = usePathname();
  const callbackURL = pathname === "/" ? undefined : pathname;
  const { data: user, isLoading } = useGetUser();
  const router = useRouter();
  const selectedStore: string | null = null;

  if (isLoading) {
    return <Skeleton className="hidden size-8 rounded-md md:block" />;
  }
  if (!user) {
    return (
      <Link
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "hidden md:inline-flex"
        )}
        href={{
          pathname: "/prihlasenie",
          query: callbackURL ? { origin: callbackURL } : undefined,
        }}
        prefetch
      >
        <LogInIcon className="size-4" />
        <span className="sr-only">Prihlásiť sa</span>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Účet" asChild>
        <Avatar className="relative hidden size-8 rounded-md md:flex">
          <AvatarImage
            className="rounded-md object-cover"
            src={user.image ?? undefined}
          />
          <AvatarFallback className="rounded-md">
            {getInitials(user.name || user.email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {selectedStore && (
          <>
            <DropdownMenuItem disabled>
              <Store className="mr-2 size-4" />
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">
                  Vybratá predajňa
                </span>
                <span className="font-medium text-sm">{selectedStore}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
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
                  router.refresh();
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
