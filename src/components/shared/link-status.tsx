import { useLinkStatus } from "next/link";
import type { ReactNode } from "react";
import { Fragment } from "react/jsx-runtime";
import { Spinner } from "../ui/spinner";

type Props = {
  children: ReactNode;
  variant: "spinner" | "dot";
};
export function LinkStatus({ children, variant }: Props) {
  const { pending } = useLinkStatus();

  if (variant === "spinner") {
    return (
      <Fragment>
        {pending ? (
          <div className="flex items-center gap-2">
            {children} <Spinner />
          </div>
        ) : (
          children
        )}
      </Fragment>
    );
  }
  if (variant === "dot") {
    return (
      <Fragment>
        {pending ? (
          <div className="flex items-center gap-2">
            {children} <span className="animate-pulse">...</span>
          </div>
        ) : (
          children
        )}
      </Fragment>
    );
  }
  return children;
}
