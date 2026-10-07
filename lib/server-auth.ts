import "server-only";
import { cookies } from "next/headers";
import { getDatabase } from "./database.mjs";
import { getAdminEmail, sameOrigin, validSession } from "./auth-core.mjs";
export const sessionCookieName =
  process.env.NODE_ENV === "production"
    ? "__Host-portfolio-session"
    : "portfolio-session";
export async function isAdministrator() {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) return false;
  try {
    return await validSession(getDatabase(), token, getAdminEmail());
  } catch {
    return false;
  } // Сан/тохиргоо ажиллахгүй бол эрх олгохгүй.
}
export async function requireAdministrator(request: Request) {
  try {
    if (!sameOrigin(request) || !(await isAdministrator()))
      return Response.json({ error: "forbidden" }, { status: 403 });
    return null;
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
