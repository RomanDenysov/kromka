import Image from "next/image";
import { BackButton } from "@/components/shared/back-button";
import { LoginView } from "@/features/login/ui/login-view";
import doorsPhoto from "../../../public/images/doors.webp";

type Props = {
  searchParams: Promise<{
    origin?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { origin } = await searchParams;
  return (
    <div className="relative flex size-full min-h-screen items-center justify-center">
      <BackButton className="absolute top-4 left-4 z-10" />
      <div className="relative hidden size-full h-screen flex-1 md:block">
        <Image
          alt="Doors"
          className="absolute inset-0 size-full object-cover object-center grayscale-[10]"
          priority
          src={doorsPhoto}
        />
      </div>
      <div className="flex-1">
        <LoginView callbackURL={origin ?? "/"} />
      </div>
    </div>
  );
}
