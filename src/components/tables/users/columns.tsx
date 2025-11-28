"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  CheckCircleIcon,
  LockIcon,
  MoreHorizontalIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCustomerParams } from "@/hooks/use-customer-params";
import { cn, getInitials } from "@/lib/utils";
import type { User } from "@/types/users";

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    size: 32,
  },
  {
    id: "image",
    header: "",
    accessorKey: "image",
    cell: ({ row }) => (
      <Avatar className="relative size-8 rounded-md">
        <AvatarImage
          className="rounded-md object-cover"
          src={row.original.image ?? ""}
        />
        <AvatarFallback className="rounded-md" delayMs={300}>
          {getInitials(row.original.name || row.original.email)}
        </AvatarFallback>
      </Avatar>
    ),
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "flex items-center gap-0.5 font-medium text-xs",
              row.original.name.length > 0 && "cursor-pointer"
            )}
          >
            {row.original.email}
            {row.original.emailVerified && (
              <CheckCircleIcon className="size-3 text-green-800" />
            )}
          </span>
        </TooltipTrigger>
        {row.original.name.length > 0 && (
          <TooltipContent>
            <span>{row.original.name}</span>
            {/* <span>{row.original.phone}</span> */}
          </TooltipContent>
        )}
      </Tooltip>
    ),
  },
  {
    id: "role",
    header: "Pozícia",
    accessorKey: "role",
    cell: ({ row }) => (
      <Badge size="xs" variant="outline">
        {row.original.role ?? "Uživatel"}
      </Badge>
    ),
  },
  {
    id: "createdAt",
    header: "Registrovaný",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <span className="font-medium text-xs">
        {format(row.original.createdAt, "dd.MM.yyyy")}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    meta: {
      className:
        "text-right sticky right-0 bg-background group-hover:bg-[#F2F1EF] group-hover:dark:bg-secondary z-30 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-border after:absolute after:left-[-24px] after:top-0 after:bottom-0 after:w-6 after:bg-gradient-to-r after:from-transparent after:to-background group-hover:after:to-muted after:z-[-1]",
    },
    cell: ({ row }) => {
      const { setParams } = useCustomerParams();
      return (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="relative">
              <Button size="icon-xs" variant="ghost">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setParams({ customerId: row.original.id })}
              >
                <SquareArrowOutUpRightIcon />
                Otvoriť
              </DropdownMenuItem>

              <DropdownMenuItem>
                <LockIcon />
                Blokovať
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
