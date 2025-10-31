"use client";

import { LogInIcon, LogOut, Settings, Store, User } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function UserButton() {
  // TODO: Implement real auth check and user session
  const user: null = null; // Mock: replace with useSession or similar
  const selectedStore: string | null = null; // Mock: fetch from storeMembers relation
  const href = "/prihlasenie" as Route;
  if (!user) {
    return (
      <Link
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        href={href}
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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Môj účet</DropdownMenuLabel>
        <DropdownMenuSeparator />
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
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 size-4" />
          Odhlásiť sa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
