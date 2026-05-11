import { type NextRequest, NextResponse } from "next/server";
import { STORE_MANAGER_BASE_PATH } from "@/features/store-manager/paths";
import { STAFF_ROLES } from "@/lib/auth/guards";
import { auth } from "@/lib/auth/server";

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname === "/predajna" || pathname.startsWith("/predajna/")) {
    const suffix =
      pathname === "/predajna" ? "" : pathname.slice("/predajna".length);
    const url = req.nextUrl.clone();
    url.pathname = `${STORE_MANAGER_BASE_PATH}${suffix}`;
    return NextResponse.redirect(url, 308);
  }

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const role = session?.user?.role;

  const isAdminPath = pathname.startsWith("/admin");
  const isStorePath = pathname.startsWith(STORE_MANAGER_BASE_PATH);
  const isGated = isAdminPath || isStorePath;

  if (!isGated) {
    return NextResponse.next();
  }

  // Unauthenticated -> login
  if (!session?.user) {
    return NextResponse.redirect(new URL("/prihlasenie", req.url));
  }

  // Authenticated but wrong role -> home
  const allowed =
    (isAdminPath && role === "admin") ||
    (isStorePath &&
      !!role &&
      (STAFF_ROLES as readonly string[]).includes(role));

  if (!allowed) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/predajna",
    "/predajna/:path*",
    "/manager/predajna",
    "/manager/predajna/:path*",
  ],
};
