import type { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
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
    <header className="sticky inset-x-0 top-0 z-30 bg-background">
      <div
        className={cn(
          "flex h-(--header-height) items-center px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
          className
        )}
      >
        <div className="flex shrink-0 items-center gap-1 lg:gap-2">
          <SidebarTrigger className="mr-2" />
          <AdminBreadcrumbs breadcrumbs={breadcrumbs} />
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          {children}
        </div>
      </div>
      <hr />
    </header>
  );
}
