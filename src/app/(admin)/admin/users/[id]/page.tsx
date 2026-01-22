import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserById } from "@/features/user-management/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { UserDetailContent } from "./_components/user-detail-content";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function UserLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const user = await getUserById(decodedId);

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Používateľ nebol nájdený</p>
      </div>
    );
  }

  return <UserDetailContent user={user} />;
}

export default function AdminUserPage({ params }: Props) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Používatelia", href: "/admin/users" },
          { label: "Detail používateľa" },
        ]}
      />
      <section className="@container/page h-full flex-1 p-4">
        <Suspense fallback={<UserDetailSkeleton />}>
          <UserLoader params={params} />
        </Suspense>
      </section>
    </>
  );
}

function UserDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
