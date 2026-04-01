import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Predajna",
    template: "%s | Predajna Kromka",
  },
  description: "Rozhranie pre manazera predajne Kromka.",
};

interface Props {
  readonly children: ReactNode;
}

export default function StoreManagerLayout({ children }: Props) {
  return <>{children}</>;
}
