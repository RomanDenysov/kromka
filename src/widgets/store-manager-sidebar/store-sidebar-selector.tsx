"use client";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Icons } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { STORE_MANAGER_BASE_PATH } from "@/features/store-manager/paths";

export interface StoreSelectorStore {
  id: string;
  name: string;
  slug: string;
}

export interface StoreSelectorProps {
  storeName: string;
  storeSlug: string;
  stores: readonly StoreSelectorStore[];
  storeType?: string;
}

/**
 * Presentational store picker. Kept as a client component so the nested
 * Radix `asChild` Slot chain (DropdownMenuTrigger → SidebarMenuButton →
 * Tooltip) hydrates as a single unit, avoiding SSR/client prop-merge drift.
 */
export function StoreSelector({
  stores,
  storeName,
  storeSlug,
  storeType,
}: StoreSelectorProps) {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" tooltip={storeName}>
                <Icons.logo className="size-4!" />
                <div className="flex flex-col group-data-[state=collapsed]:hidden">
                  <span className="line-clamp-1 text-ellipsis font-medium text-xs leading-tight">
                    {storeName}
                  </span>
                  {storeType && (
                    <span className="text-[10px] text-muted-foreground">
                      {storeType}
                    </span>
                  )}
                </div>
                <ChevronsUpDownIcon className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {stores.length > 0 ? (
                stores.map((store) => {
                  const isCurrentStore = store.slug === storeSlug;

                  return (
                    <DropdownMenuItem asChild key={store.id}>
                      <Link
                        aria-current={isCurrentStore ? "page" : undefined}
                        href={
                          `${STORE_MANAGER_BASE_PATH}/${store.slug}` as Route
                        }
                      >
                        <Icons.logo className="size-4!" />
                        <span className="line-clamp-1 flex-1">
                          {store.name}
                        </span>
                        {isCurrentStore && (
                          <CheckIcon className="size-4 text-muted-foreground" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <DropdownMenuItem asChild>
                  <Link href={STORE_MANAGER_BASE_PATH as Route}>
                    <Icons.logo className="size-4!" />
                    <span>Vybrat predajnu</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
