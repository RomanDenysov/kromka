import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { NumberField } from "@/components/shared/fields/number-field";

const numberInputGroupVariants = cva(
  "flex w-fit items-center overflow-hidden rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-[input:disabled]:pointer-events-none has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50 [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l [&>*:not(:first-child)]:border-l-input [&>*:not(:last-child)]:rounded-r-none [&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-r-input [&>*]:focus-visible:relative [&>*]:focus-visible:z-10",
  {
    variants: {
      size: {
        default: "h-9",
        sm: "h-8",
        xs: "h-7",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const numberInputFieldVariants = cva(
  "w-full min-w-0 flex-1 border-0 bg-transparent text-center shadow-none outline-none transition-colors selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-9 px-3 py-1 text-base md:text-sm",
        sm: "h-8 px-2 py-0.5 text-sm",
        xs: "h-7 px-1.5 py-0.5 text-xs md:text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const numberInputButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-md font-medium text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      size: {
        default: "size-9 [&_svg]:size-4",
        sm: "size-8 [&_svg]:size-3.5",
        xs: "size-7 [&_svg]:size-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

type NumberInputRootProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange"
> & {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

type NumberInputProps = NumberInputRootProps &
  VariantProps<typeof numberInputGroupVariants> & {
    /** Optional small label rendered above the control when used standalone. */
    label?: React.ReactNode;
    /** Show the inline label wrapper. Useful outside of `Field`. */
    showLabel?: boolean;
    /** Extra class for the numeric input element. */
    inputClassName?: string;
    /** Extra class for both increment and decrement buttons. */
    buttonClassName?: string;
  };

const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(
  (
    {
      className,
      size,
      label,
      showLabel = false,
      inputClassName,
      buttonClassName,
      ...rootProps
    },
    ref
  ) => (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      {showLabel && label ? (
        <span className="font-medium text-foreground text-sm leading-snug">
          {label}
        </span>
      ) : null}

      <NumberField.Root ref={ref} {...rootProps}>
        <NumberField.Group className={cn(numberInputGroupVariants({ size }))}>
          <NumberField.Decrement
            className={cn(numberInputButtonVariants({ size }), buttonClassName)}
          />
          <NumberField.Input
            className={cn(
              numberInputFieldVariants({ size }),
              "max-w-12 px-0.5 py-0 font-mono",
              inputClassName
            )}
          />
          <NumberField.Increment
            className={cn(numberInputButtonVariants({ size }), buttonClassName)}
          />
        </NumberField.Group>
      </NumberField.Root>
    </div>
  )
);

NumberInput.displayName = "NumberInput";

export { NumberInput, type NumberInputProps };
