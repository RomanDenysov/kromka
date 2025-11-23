import { AdminHeader } from "@/components/admin-header/admin-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <>
      <AdminHeader breadcrumbs={[{ label: "Dashboard", href: "/admin" }]} />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-1 h-8 w-[60px]" />
                <Skeleton className="h-3 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <Skeleton className="h-6 w-[140px]" />
                <Skeleton className="h-4 w-[180px]" />
              </div>
              <Skeleton className="ml-auto h-4 w-[60px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
