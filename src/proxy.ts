import { type NextRequest, NextResponse } from "next/server";
import { STAFF_ROLES } from "@/lib/auth/guards";
import { auth } from "@/lib/auth/server";

export default async function middleware(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const role = session?.user?.role;
  const pathname = req.nextUrl.pathname;

  const isAdminPath = pathname.startsWith("/admin");
  const isStorePath = pathname.startsWith("/predajna");

  const denied =
    (isAdminPath && role !== "admin") ||
    (isStorePath && !(role && STAFF_ROLES.includes(role)));

  if (denied) {
    return NextResponse.redirect(new URL("/prihlasenie", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/predajna/:path*"],
};
