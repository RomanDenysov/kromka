import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import {
  type AdminBreadcrumbItem,
  AdminBreadcrumbs,
} from "./admin-breadcrumbs";

type Props = {
  breadcrumbs: AdminBreadcrumbItem[];
  className?: string;
  children?: ReactNode;
};

export function AdminHeader({ breadcrumbs, className, children }: Props) {
  return (
    <header className="sticky inset-x-0 top-0 z-40 w-full bg-sidebar">
      <div
        className={cn(
          "flex h-(--header-height) items-center px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
          className
        )}
      >
        <div className="flex shrink-0 items-center gap-1 lg:gap-2">
          <SidebarTrigger />
          <Separator
            className="mx-2 data-[orientation=vertical]:h-6"
            orientation="vertical"
          />
          <AdminBreadcrumbs breadcrumbs={breadcrumbs} />
        </div>
        <div className="ml-auto flex items-center gap-2">{children}</div>
      </div>
      <hr />
    </header>
  );
}
