import type { Route } from "next";
import { Fragment } from "react/jsx-runtime";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

export type AdminBreadcrumbItem = {
  label: string;
  href?: Route;
};

type Props = {
  breadcrumbs: AdminBreadcrumbItem[];
};

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
                <BreadcrumbLink className="font-medium" href={item.href ?? "#"}>
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        );
      })}
    </BreadcrumbList>
  </Breadcrumb>
);
