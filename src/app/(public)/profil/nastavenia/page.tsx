import { getAuth } from "@/lib/auth/session";
import { ProfileSettingsForm } from "./_components/profile-settings-form";

export default async function NastaveniaPage() {
  const { user } = await getAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-2xl">Nastavenia účtu</h1>
        <p className="text-muted-foreground">
          Upravte svoje osobné údaje a preferencie
        </p>
      </div>

      <ProfileSettingsForm user={user} />
    </div>
  );
}
