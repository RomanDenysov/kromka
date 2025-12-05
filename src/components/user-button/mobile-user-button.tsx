import { PackageIcon, SettingsIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAuth } from "@/lib/auth/session";
import { cn, getInitials } from "@/lib/utils";
import { SignInLink } from "./sign-in-link";
import { SignOutButton } from "./sign-out-button";

export async function MobileUserButton() {
  const { user } = await getAuth();
  if (!user || user?.isAnonymous) {
    return <SignInLink mobile />;
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
        <SignOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
