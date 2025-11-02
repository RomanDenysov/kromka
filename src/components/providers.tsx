import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { PageTracker } from "react-page-tracker";
import { QueryProvider } from "./query-provider";

type Props = {
  readonly children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <QueryProvider>
      <NuqsAdapter>
        <PageTracker enableStrictModeHandler={false} />
        {children}
      </NuqsAdapter>
    </QueryProvider>
  );
}
