import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { resolveRender } from "@/lib/resolve-render";
import { cn } from "@/lib/utils";

function Breadcrumb({ ...props }: ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: ComponentProps<"ol">) {
  return (
    <ol
      className={cn(
        "wrap-break-word flex flex-wrap items-center gap-1.5 text-muted-foreground text-sm sm:gap-2.5",
        className
      )}
      data-slot="breadcrumb-list"
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      className={cn("inline-flex items-center gap-1.5", className)}
      data-slot="breadcrumb-item"
      {...props}
    />
  );
}

function BreadcrumbLink({
  asChild,
  className,
  render,
  children,
  ...props
}: useRender.ComponentProps<"a"> & {
  /** @deprecated Use `render` instead */
  asChild?: boolean;
  render?: ReactElement;
  children?: ReactNode;
}) {
  const resolvedRender = resolveRender(render, asChild, children);

  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        "data-slot": "breadcrumb-link",
        className: cn("transition-colors hover:text-foreground", className),
        children: resolvedRender ? undefined : children,
      } as React.ComponentProps<"a">,
      props
    ),
    render: resolvedRender,
    state: {
      slot: "breadcrumb-link",
    },
  });
}

function BreadcrumbPage({ className, ...props }: ComponentProps<"span">) {
  return (
    // biome-ignore lint/a11y/useFocusableInteractive: we need to use a span as a link for the BreadcrumbPage
    // biome-ignore lint/a11y/useSemanticElements: we need to use a span as a link for the BreadcrumbPage
    <span
      aria-current="page"
      aria-disabled="true"
      className={cn("font-normal text-foreground", className)}
      data-slot="breadcrumb-page"
      role="link"
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: ComponentProps<"li">) {
  return (
    <li
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      data-slot="breadcrumb-separator"
      role="presentation"
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
