import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactElement, ReactNode } from "react";
import { resolveRender } from "@/lib/resolve-render";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border font-medium text-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        success:
          "border-transparent bg-emerald-500 text-white shadow hover:bg-emerald-600 focus-visible:ring-emerald-500/20 dark:bg-emerald-500/90 dark:focus-visible:ring-emerald-500/40",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
      size: {
        default: "px-2 py-0.5",
        sm: "px-1.5 py-0.5",
        xs: "px-1 py-0 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type BadgeProps = useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    /** @deprecated Use `render` instead */
    asChild?: boolean;
    render?: ReactElement;
    children?: ReactNode;
  };

function Badge({
  className,
  variant,
  size,
  asChild = false,
  render,
  children,
  ...props
}: BadgeProps) {
  const resolvedRender = resolveRender(render, asChild, children);

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        "data-slot": "badge",
        className: cn(badgeVariants({ variant, size }), className),
        children: resolvedRender ? undefined : children,
      } as React.ComponentProps<"span">,
      props
    ),
    render: resolvedRender,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
