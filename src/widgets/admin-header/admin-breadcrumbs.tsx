import type { Route } from "next";
import Link from "next/link";
import { Fragment } from "react/jsx-runtime";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface AdminBreadcrumbItem {
  href?: Route;
  label: string;
}

interface Props {
  breadcrumbs: AdminBreadcrumbItem[];
}

export const AdminBreadcrumbs = ({ breadcrumbs }: Props) => (
  <Breadcrumb>
    <BreadcrumbList className="font-medium sm:gap-1.5">
      {breadcrumbs.map((item, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        return (
          <Fragment key={item.label + idx.toString()}>
            {idx > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem className={isLast ? "" : "hidden md:block"}>
              {isLast ? (
                <BreadcrumbPage className="font-medium">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild className="font-medium">
                  <Link href={item.href ?? "#"}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        );
      })}
    </BreadcrumbList>
  </Breadcrumb>
);
