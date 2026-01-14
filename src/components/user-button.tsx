"use client";

import {
  LogInIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  PackageIcon,
  SettingsIcon,
  StoreIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { use } from "react";
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
import { signOut } from "@/lib/auth/client";
import type { UserDetails } from "@/lib/auth/session";
import { getInitials } from "@/lib/utils";
import { useStoreModalState } from "@/store/store-modal-state";
import { Icons } from "./icons";

export function UserButton({ promise }: { promise: Promise<UserDetails> }) {
  const user = use(promise);
  const open = useStoreModalState((state) => state.open);
  const router = useRouter();
  const pathname = usePathname();
  const callbackURL = pathname === "/" ? undefined : pathname;

  if (!user) {
    return (
      <Link
        className={buttonVariants({
          variant: "outline",
          size: "icon-sm",
        })}
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
          <AvatarFallback className="rounded-md font-medium text-sm">
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
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={open}>
          <StoreIcon />
          <span className="truncate">
            {user.store?.name ?? "Vybrať predajňu"}
          </span>
          <MoreHorizontalIcon className="size-4" />
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
