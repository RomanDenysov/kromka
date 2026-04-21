import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-sm font-medium text-sm outline-none transition-[color,background-color,border-color,box-shadow,opacity,text-decoration-color,transform] duration-200 ease-out motion-reduce:duration-0 motion-safe:active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95",
        brand:
          "bg-brand text-white hover:bg-brand/80 active:bg-brand/90",
        "brand-outline":
          "border border-brand text-brand hover:bg-brand/10 active:bg-brand/15",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/85 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:bg-accent/90 dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/80 dark:hover:bg-accent/50 dark:active:bg-accent/40",
        glass:
          "border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-black active:bg-white/90 active:text-black",
        link:
          "text-primary underline-offset-4 hover:underline active:opacity-70 motion-safe:active:scale-100",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-sm px-3 has-[>svg]:px-2.5",
        xs: "h-7 gap-0.5 rounded-sm px-2 text-xs has-[>svg]:px-1.5",
        lg: "h-10 rounded-sm px-6 has-[>svg]:px-4",
        xl: "h-11 rounded-sm px-8 has-[>svg]:px-6",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-5",
        "icon-xs": "size-7",
        "icon-xl": "size-11 [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      data-slot="button"
      {...props}
    />
  );
}

export { Button, buttonVariants, type ButtonProps };
