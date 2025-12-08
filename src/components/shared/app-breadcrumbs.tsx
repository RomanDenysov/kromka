import { ChevronLeftIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BackButton } from "./back-button";

export type BreadcrumbItemType = {
  label: string;
  href?: Route;
};

type Props = {
  items: BreadcrumbItemType[];
};

export function AppBreadcrumbs({ items }: Props) {
  return (
    <Breadcrumb>
      <BackButton className="md:hidden" size="sm" variant="link">
        <ChevronLeftIcon className="size-4" />
        Späť
      </BackButton>
      <BreadcrumbList className="hidden font-medium md:flex">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Domov</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={item.label}>
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
