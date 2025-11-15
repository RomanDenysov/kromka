import { LogInIcon, LogOut, Settings, Store, User } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUser } from "@/lib/auth/auth-utils";
import { cn } from "@/lib/utils";
import { Icons } from "../icons";

export async function UserButton() {
  const selectedStore: string | null = null;
  const user = await getUser();
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
      <DropdownMenuTrigger asChild>
        <Button className="gap-2" size="icon-sm" variant="outline">
          <User className="size-4" />
          <span className="sr-only">Účet</span>
        </Button>
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
