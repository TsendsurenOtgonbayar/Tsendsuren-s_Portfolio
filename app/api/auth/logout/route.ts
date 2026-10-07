import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/database.mjs";
import { getAppOrigin, revokeSession, sameOrigin } from "@/lib/auth-core.mjs";
import { sessionCookieName } from "@/lib/server-auth";
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
    const token = (await cookies()).get(sessionCookieName)?.value;
    if (token) await revokeSession(getDatabase(), token);
    const response = NextResponse.redirect(
      new URL("/admin/login", getAppOrigin()),
      303,
    );
    response.cookies.set(sessionCookieName, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch {
    return new Response(
      "Гарах үйлдэл амжилтгүй. Дахин оролдоно уу. / Sign-out failed. Please retry.",
      { status: 503 },
    );
  }
}
