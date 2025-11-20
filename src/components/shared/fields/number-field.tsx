"use client";

import { Slot } from "@radix-ui/react-slot";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { MinusIcon, PlusIcon } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  createContext,
  forwardRef,
  useContext,
  useRef,
} from "react";
import { cn } from "@/lib/utils";

type NumberFieldContextValue = {
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  onChange: (value: number) => void;
  increment: () => void;
  decrement: () => void;
};

const NumberFieldContext = createContext<NumberFieldContextValue | null>(null);

function useNumberField() {
  const context = useContext(NumberFieldContext);
  if (!context) {
    throw new Error(
      "NumberField components must be used within NumberField.Root"
    );
  }
  return context;
}

type RootProps = Omit<ComponentPropsWithoutRef<"div">, "onChange"> & {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

const Root = forwardRef<ComponentRef<"div">, RootProps>(
  (
    {
      value: valueProp,
      defaultValue = 0,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [value = 0, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange,
    });

    const clamp = (num: number) => Math.max(min, Math.min(num, max));

    const handleChange = (newValue: number) => {
      setValue(clamp(newValue));
    };

    const increment = () => {
      handleChange(value + step);
    };

    const decrement = () => {
      handleChange(value - step);
    };

    return (
      <NumberFieldContext.Provider
        value={{
          value,
          min,
          max,
          step,
          disabled,
          onChange: handleChange,
          increment,
          decrement,
        }}
      >
        {/* biome-ignore lint/suspicious/noExplicitAny: React 19 type incompatibility */}
        <div
          className={className}
          data-disabled={disabled || undefined}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </NumberFieldContext.Provider>
    );
  }
);
Root.displayName = "NumberField.Root";

type ScrubAreaProps = ComponentPropsWithoutRef<"div"> & {
  sensitivity?: number;
};

const ScrubArea = forwardRef<ComponentRef<"div">, ScrubAreaProps>(
  ({ sensitivity = 0.5, className, children, ...props }, ref) => {
    const { value, step, onChange, disabled } = useNumberField();
    const isDraggingRef = useRef(false);
    const initialXRef = useRef(0);
    const initialValueRef = useRef(value);

    const handlePointerDown = (e: React.PointerEvent) => {
      if (disabled || e.button !== 0) {
        return;
      }

      isDraggingRef.current = true;
      initialXRef.current = e.clientX;
      initialValueRef.current = value;

      document.body.style.cursor = "ew-resize";
      e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDraggingRef.current) {
        return;
      }

      const deltaX = e.clientX - initialXRef.current;
      const deltaSteps = Math.round(deltaX * sensitivity);
      const newValue = initialValueRef.current + deltaSteps * step;
      onChange(newValue);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      if (!isDraggingRef.current) {
        return;
      }

      isDraggingRef.current = false;
      document.body.style.cursor = "";
      e.currentTarget.releasePointerCapture(e.pointerId);
    };

    return (
      // biome-ignore lint/suspicious/noExplicitAny: React 19 type incompatibility
      <div
        className={cn("cursor-ew-resize touch-none select-none", className)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ScrubArea.displayName = "NumberField.ScrubArea";

const Group = forwardRef<ComponentRef<"div">, ComponentPropsWithoutRef<"div">>(
  ({ className, children, ...props }, ref) => (
    // biome-ignore lint/suspicious/noExplicitAny: React 19 type incompatibility
    <div
      className={cn("flex items-center gap-1", className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
);
Group.displayName = "NumberField.Group";

const Input = forwardRef<
  ComponentRef<"input">,
  ComponentPropsWithoutRef<"input">
>(({ className, onChange, ...props }, ref) => {
  const { value, disabled, onChange: contextOnChange } = useNumberField();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(e.target.value);
    if (!Number.isNaN(parsed)) {
      contextOnChange(parsed);
    }
    onChange?.(e);
  };

  return (
    // biome-ignore lint/suspicious/noExplicitAny: React 19 type incompatibility
    <input
      className={cn(
        "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        className
      )}
      disabled={disabled}
      onChange={handleChange}
      ref={ref}
      type="number"
      value={value}
      {...props}
    />
  );
});
Input.displayName = "NumberField.Input";

type DecrementProps = ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean;
};

const Decrement = forwardRef<ComponentRef<"button">, DecrementProps>(
  ({ asChild = false, className, children, ...props }, ref) => {
    const { decrement, disabled, value, min } = useNumberField();
    const Comp = asChild ? Slot : "button";

    return (
      // biome-ignore lint/suspicious/noExplicitAny: React 19 type incompatibility
      <Comp
        className={className}
        disabled={disabled || value <= min}
        onClick={decrement}
        ref={ref}
        type={asChild ? undefined : "button"}
        {...props}
      >
        {children ?? <MinusIcon className="size-4" />}
      </Comp>
    );
  }
);
Decrement.displayName = "NumberField.Decrement";

type IncrementProps = ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean;
};

const Increment = forwardRef<ComponentRef<"button">, IncrementProps>(
  ({ asChild = false, className, children, ...props }, ref) => {
    const { increment, disabled, value, max } = useNumberField();
    const Comp = asChild ? Slot : "button";

    return (
      // biome-ignore lint/suspicious/noExplicitAny: React 19 type incompatibility
      <Comp
        className={className}
        disabled={disabled || value >= max}
        onClick={increment}
        ref={ref}
        type={asChild ? undefined : "button"}
        {...props}
      >
        {children ?? <PlusIcon className="size-4" />}
      </Comp>
    );
  }
);
Increment.displayName = "NumberField.Increment";

export const NumberField = {
  Root,
  ScrubArea,
  Group,
  Input,
  Decrement,
  Increment,
};
