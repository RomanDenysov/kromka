import { ErrorState } from "@/components/shared/error-state";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <ErrorState />
    </div>
  );
}
