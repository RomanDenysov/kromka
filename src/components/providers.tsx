import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { PageTracker } from "react-page-tracker";

type Props = {
  readonly children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <NuqsAdapter>
      <PageTracker enableStrictModeHandler={false} />
      {children}
    </NuqsAdapter>
  );
}
