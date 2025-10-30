import { LoginView } from "@/features/login/ui/login-view";

type Props = {
  searchParams: Promise<{
    origin?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { origin } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginView callbackURL={origin ?? "/"} />
    </div>
  );
}
