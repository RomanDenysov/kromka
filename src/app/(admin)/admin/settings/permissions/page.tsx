import { Suspense } from "react";
import { SettingsRow } from "@/components/settings/settings-row";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/db/types";
import { getUsers } from "@/lib/queries/users";
import { cn } from "@/lib/utils";

async function PermissionsLoader() {
  const users = await getUsers();

  // Group users by role
  const usersByRole = users.reduce(
    (acc, user) => {
      const role = user.role ?? "user";
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push(user);
      return acc;
    },
    {} as Record<UserRole, typeof users>
  );

  const roleLabels: Record<UserRole, string> = {
    admin: "Administrátor",
    manager: "Manažér",
    user: "Užívateľ",
  };

  const roleColors: Record<UserRole, string> = {
    admin: "bg-red-500/10 text-red-700 dark:text-red-400",
    manager: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    user: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {(Object.keys(roleLabels) as UserRole[]).map((role) => {
          const usersInRole = usersByRole[role] ?? [];
          return (
            <SettingsRow
              control={
                <div className="flex items-center gap-2">
                  <Badge className={cn("font-medium", roleColors[role])}>
                    {usersInRole.length}
                  </Badge>
                </div>
              }
              description={`${usersInRole.length} ${
                usersInRole.length === 1 ? "užívateľ" : "užívateľov"
              } s touto rolou`}
              icon={role === "admin" ? "ShieldIcon" : "UsersIcon"}
              key={role}
              title={roleLabels[role]}
            />
          );
        })}
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold text-lg">Užívatelia podľa rolí</h2>
          <p className="text-muted-foreground text-sm">
            Prehľad všetkých užívateľov zoradených podľa ich rolí.
          </p>
        </div>
        <div className="space-y-4">
          {(Object.keys(roleLabels) as UserRole[]).map((role) => {
            const usersInRole = usersByRole[role] ?? [];
            if (usersInRole.length === 0) {
              return null;
            }

            return (
              <div className="space-y-2" key={role}>
                <h3 className="font-medium text-muted-foreground text-sm">
                  {roleLabels[role]} ({usersInRole.length})
                </h3>
                <div className="space-y-3">
                  {usersInRole.map((user) => (
                    <div
                      className="flex items-center justify-between rounded-md border bg-card p-4"
                      key={user.id}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {user.email}
                        </div>
                      </div>
                      <Badge className={cn("font-medium", roleColors[role])}>
                        {roleLabels[role]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">Povolenia užívateľov</h1>
        <p className="text-muted-foreground text-sm">
          Prehľad rolí a oprávnení užívateľov v systéme.
        </p>
      </div>
      <Suspense
        fallback={<div className="text-muted-foreground">Načítavanie...</div>}
      >
        <PermissionsLoader />
      </Suspense>
    </div>
  );
}
