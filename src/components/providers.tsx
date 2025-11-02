import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { PageTracker } from "react-page-tracker";
import { TRPCReactProvider } from "@/trpc/client";

type Props = {
  readonly children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <TRPCReactProvider>
      <NuqsAdapter>
        <PageTracker enableStrictModeHandler={false} />
        {children}
      </NuqsAdapter>
    </TRPCReactProvider>
  );
}
