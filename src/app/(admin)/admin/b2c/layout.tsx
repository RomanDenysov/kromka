import type { ReactNode } from "react";

type Props = {
  readonly children: ReactNode;
  readonly panel: ReactNode;
};

export default function B2CLayout({ children }: Props) {
  return (
    <>
      {children}
      {/* {panel} */}
    </>
  );
}
