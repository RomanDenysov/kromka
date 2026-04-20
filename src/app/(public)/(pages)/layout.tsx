import type { ReactNode } from "react";

interface Props {
  readonly children: ReactNode;
}

export default function PagesLayout({ children }: Props) {
  return children;
}
