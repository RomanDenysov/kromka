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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth/client";
import { cn, getInitials } from "@/lib/utils";
import { Icons } from "./icons";
import { Skeleton } from "./ui/skeleton";

export function UserButton() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const router = useRouter();
  const pathname = usePathname();
  const callbackURL = pathname === "/" ? undefined : pathname;

  if (isPending) {
    return <Skeleton className="size-8 rounded-md" />;
  }

  if (!user) {
    return (
      <Link
        className={cn(
          buttonVariants({
            variant: "outline",
            size: "icon-sm",
          }),
          "text-primary"
        )}
        href={{
          pathname: "/prihlasenie",
          query: callbackURL ? { origin: callbackURL } : undefined,
        }}
      >
        <LogInIcon />
        <span className="sr-only">Prihlásiť sa</span>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Účet" asChild>
        <Avatar className="relative size-8 rounded-md">
          <AvatarImage
            className="rounded-md object-cover"
            src={user.image ?? undefined}
          />
          <AvatarFallback className="rounded-md font-medium text-primary text-sm">
            {getInitials(user.name || user.email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
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
        {user.role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <Icons.logo className="size-4" />
                Admin panel
              </Link>
            </DropdownMenuItem>
          </>
        )}
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
