"use client";

import { CheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type Props = Omit<ButtonProps, "value"> & {
  isActive: boolean;
  onToggle: () => Promise<void>;
};

export function RowToggleButton({
  isActive,
  onToggle,
  className,
  ...props
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimisticState] = useOptimistic(isActive);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setOptimisticState((state) => !state);

    startTransition(async () => {
      try {
        await onToggle();
      } catch (error) {
        setOptimisticState(isActive);
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.error("Failed to toggle:", error);
      } finally {
        router.refresh();
      }
    });
  };

  if (isActive !== optimisticState && !isPending) {
    setOptimisticState(isActive);
  }

  const currentState = optimisticState;

  return (
    <Button
      aria-pressed={currentState}
      className={cn("w-24", className)}
      data-state={currentState ? "on" : "off"}
      disabled={isPending}
      onClick={handleClick}
      type="button"
      variant={currentState ? "default" : "outline"}
      {...props}
    >
      {currentState ? (
        <>
          Aktívny{" "}
          {isPending ? (
            <Spinner className="size-4" />
          ) : (
            <CheckIcon className="size-4" />
          )}
        </>
      ) : (
        <>
          Neaktívny{" "}
          {isPending ? (
            <Spinner className="size-4" />
          ) : (
            <XIcon className="size-4" />
          )}
        </>
      )}
    </Button>
  );
}
