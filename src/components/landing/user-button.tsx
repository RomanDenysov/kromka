import { LogInIcon, LogOut, Settings, Store } from "lucide-react";
import type { Route } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/auth/server";
import { cn, getInitials } from "@/lib/utils";
import { Icons } from "../icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export async function UserButton() {
  const selectedStore: string | null = null;
  const user = await auth.api.getSession({ headers: await headers() });
  if (!user) {
    return (
      <Link
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        href={"/prihlasenie" as Route}
      >
        <LogInIcon className="size-4" />
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
            src={user.user.image ?? undefined}
          />
          <AvatarFallback className="rounded-md" delayMs={300}>
            {getInitials(user.user.name || user.user.email)}
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
        <DropdownMenuItem>
          <Settings className="mr-2 size-4" />
          Nastavenia
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className="flex items-center gap-2" href="/admin">
            <Icons.logo className="mr-2 size-4" />
            Admin panel
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 size-4" />
          Odhlásiť sa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
