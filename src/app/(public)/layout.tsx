import type { ReactNode } from "react";

type Props = {
  readonly children: ReactNode;
};

export default function PublicLayout({ children }: Props) {
  return <div>{children}</div>;
}
