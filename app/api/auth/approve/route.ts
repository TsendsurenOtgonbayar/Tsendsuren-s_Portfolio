import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database.mjs";
import {
  approveLogin,
  getAdminEmail,
  getAppOrigin,
  sameOrigin,
  SESSION_LIFETIME_SECONDS,
} from "@/lib/auth-core.mjs";
import { sessionCookieName } from "@/lib/server-auth";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
    const form = await request.formData();
    const sessionToken = await approveLogin(
      getDatabase(),
      form.get("token"),
      getAdminEmail(),
    );
    if (!sessionToken)
      return NextResponse.redirect(
        new URL("/admin/login?error=expired", getAppOrigin()),
        303,
      );
    const response = NextResponse.redirect(
      new URL("/admin", getAppOrigin()),
      303,
    );
    response.cookies.set(sessionCookieName, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_LIFETIME_SECONDS,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return new Response(
      "Нэвтрэх боломжгүй. Дахин оролдоно уу. / Sign-in unavailable.",
      { status: 503 },
    );
  }
}
