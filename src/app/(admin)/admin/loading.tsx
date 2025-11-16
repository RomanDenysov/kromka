import { Spinner } from "@/components/ui/spinner";

export default function AdminLoading() {
  return (
    <div className="flex h-svh items-center justify-center bg-background">
      <Spinner className="size-10 text-muted-foreground" />
    </div>
  );
}
