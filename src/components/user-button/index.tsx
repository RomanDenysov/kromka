import { PackageIcon, SettingsIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAuth } from "@/lib/auth/session";
import { getInitials } from "@/lib/utils";
import { Icons } from "../icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SignInLink } from "../user-button/sign-in-link";
import { SignOutButton } from "../user-button/sign-out-button";

export async function UserButton() {
  const { user } = await getAuth();
  if (!user || user?.isAnonymous) {
    return <SignInLink />;
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
        <DropdownMenuItem asChild>
          <Link href="/profil">
            <UserIcon />
            Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profil/nastavenia" prefetch>
            <SettingsIcon />
            Nastavenia
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profil/objednavky" prefetch>
            <PackageIcon />
            Objednavky
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin" prefetch>
            <Icons.logo className="size-4" />
            Admin panel
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
