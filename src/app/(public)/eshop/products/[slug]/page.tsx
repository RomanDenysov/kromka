import { ErrorBoundary } from "react-error-boundary";
import { HydrateClient } from "@/trpc/server";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error</div>}>
        <div>ProductPage {slug}</div>
      </ErrorBoundary>
    </HydrateClient>
  );
}
