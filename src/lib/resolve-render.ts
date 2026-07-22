import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

/** @deprecated Use `render` instead */
export interface AsChildProps {
  asChild?: boolean;
  children?: ReactNode;
  render?: ReactElement;
}

/**
 * Resolves Base UI `render` from an explicit render prop or legacy `asChild` child.
 */
export function resolveRender(
  render: ReactElement | undefined,
  asChild: boolean | undefined,
  children: ReactNode
): ReactElement | undefined {
  if (render) {
    return render;
  }
  if (asChild) {
    const child = Children.only(children);
    if (isValidElement(child)) {
      return child;
    }
  }
  return undefined;
}

export function splitAsChildProps<T extends AsChildProps>({
  asChild,
  render,
  children,
  ...rest
}: T): {
  render?: ReactElement;
  children?: ReactNode;
  rest: Omit<T, keyof AsChildProps>;
} {
  return {
    render: resolveRender(render, asChild, children),
    children,
    rest: rest as Omit<T, keyof AsChildProps>,
  };
}
