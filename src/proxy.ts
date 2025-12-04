import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

export default async function middleware(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (
    req.nextUrl.pathname.startsWith("/admin") &&
    session?.user?.role !== "admin"
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.next();
}
