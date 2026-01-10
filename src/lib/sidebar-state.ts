"use server";

import { cookies } from "next/headers";

export async function setSidebarState(open: boolean) {
  (await cookies()).set("sidebar_state", String(open), {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}
