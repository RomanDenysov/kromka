import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

export default async function middleware(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (session?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/prihlasenie", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
  runtime: "nodejs",
};
