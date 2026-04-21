import type { ComponentProps, PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionTone = "default" | "muted" | "featured" | "dark";
type SectionSpacing = "none" | "md" | "lg" | "xl";

const toneClass: Record<SectionTone, string> = {
  default: "bg-transparent",
  muted: "bg-muted/30",
  featured: "bg-accent/80",
  dark: "bg-foreground text-background",
};

const spacingClass: Record<SectionSpacing, string> = {
  none: "",
  md: "py-8 md:py-10",
  lg: "py-12 md:py-16",
  xl: "py-16 md:py-20",
};

type PageSectionProps = PropsWithChildren<
  ComponentProps<"section"> & {
    tone?: SectionTone;
    spacing?: SectionSpacing;
  }
>;

/**
 * Full-width section band with consistent vertical rhythm for public marketing pages.
 */
export function PageSection({
  className,
  tone = "default",
  spacing = "lg",
  children,
  ...props
}: PageSectionProps) {
  return (
    <section
      className={cn(toneClass[tone], spacingClass[spacing], className)}
      {...props}
    >
      {children}
    </section>
  );
}

type Align = "left" | "center";

interface SectionHeaderProps {
  align?: Align;
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  /** Use 1 for page-level titles (Kontakt, etc.). Default 2 for section titles. */
  headingLevel?: 1 | 2;
  title: ReactNode;
}

/**
 * Repeated title block: optional eyebrow, heading, optional description.
 */
export function SectionHeader({
  title,
  eyebrow,
  description,
  align = "left",
  headingLevel = 2,
  className,
}: SectionHeaderProps) {
  const HeadingTag = headingLevel === 1 ? "h1" : "h2";
  const headingClass =
    headingLevel === 1
      ? "text-balance font-bold text-3xl tracking-tight md:text-4xl"
      : "text-balance font-bold text-2xl tracking-tight md:text-3xl";

  return (
    <div
      className={cn(
        "space-y-2",
        align === "center" && "text-center",
        className
      )}
    >
      {eyebrow != null && (
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
          {eyebrow}
        </p>
      )}
      <HeadingTag className={headingClass}>{title}</HeadingTag>
      {description != null && (
        <p
          className={cn(
            "max-w-2xl text-pretty text-base text-foreground/70 leading-relaxed md:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
