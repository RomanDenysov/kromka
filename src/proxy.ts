import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

const STAFF_ROLES = ["admin", "manager"];

export default async function middleware(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const role = session?.user?.role;
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/prihlasenie", req.url));
  }

  if (
    pathname.startsWith("/predajna") &&
    !(role && STAFF_ROLES.includes(role))
  ) {
    return NextResponse.redirect(new URL("/prihlasenie", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/predajna/:path*"],
};
