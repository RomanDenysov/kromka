import { cookies } from "next/headers";
import { consent } from "@/lib/consent";

export async function getServerConsent() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  return consent.server.get(cookieHeader);
}
