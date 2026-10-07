import { randomBytes, createHash } from "node:crypto";
export const LOGIN_LIFETIME_SECONDS = 10 * 60;
export const SESSION_LIFETIME_SECONDS = 8 * 60 * 60;
export function createToken() {
  return randomBytes(32).toString("hex");
}
export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
export function isValidToken(token) {
  return typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
}
export function getAdminEmail() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("ADMIN_EMAIL is not configured");
  return email;
}
export function getAppOrigin() {
  const configuredUrl = process.env.APP_URL;
  if (!configuredUrl) throw new Error("APP_URL is not configured");
  const url = new URL(configuredUrl);
  const localDevelopment =
    process.env.NODE_ENV !== "production" &&
    ["localhost", "127.0.0.1"].includes(url.hostname);
  if (
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    (url.protocol !== "https:" &&
      !(localDevelopment && url.protocol === "http:"))
  )
    throw new Error("APP_URL must be a trusted origin");
  return url.origin;
}
export function sameOrigin(request) {
  // Origin байхгүй хүсэлтийг ч хориглоно. Host/forwarded-host-д итгэхгүй.
  return request.headers.get("origin") === getAppOrigin();
}

// database аргумент нь тестэд тусдаа PostgreSQL engine ашиглах боломж олгоно.
export async function reserveEmailSlot(database, adminEmail) {
  // Атомик UPSERT: зэрэг ирсэн хүсэлтүүд ч минутанд нэг, цагт тав гэсэн хязгаарыг дагана.
  const result = await database.query(
    `
    INSERT INTO admin_email_limits (admin_email, window_started_at, last_sent_at, request_count)
    VALUES ($1, now(), now(), 1)
    ON CONFLICT (admin_email) DO UPDATE SET
      request_count = CASE WHEN admin_email_limits.window_started_at <= now() - interval '1 hour' THEN 1 ELSE admin_email_limits.request_count + 1 END,
      window_started_at = CASE WHEN admin_email_limits.window_started_at <= now() - interval '1 hour' THEN now() ELSE admin_email_limits.window_started_at END,
      last_sent_at = now()
    WHERE admin_email_limits.last_sent_at <= now() - interval '1 minute'
      AND (admin_email_limits.window_started_at <= now() - interval '1 hour' OR admin_email_limits.request_count < 5)
    RETURNING admin_email`,
    [adminEmail],
  );
  return result.rows.length === 1;
}
export async function createLoginRequest(database, adminEmail) {
  const token = createToken();
  await database.query(
    "DELETE FROM admin_login_requests WHERE expires_at <= now()",
  );
  await database.query("DELETE FROM admin_sessions WHERE expires_at <= now()");
  await database.query(
    `INSERT INTO admin_login_requests (token_hash, admin_email, expires_at) VALUES ($1, $2, now() + interval '10 minutes')`,
    [hashToken(token), adminEmail],
  );
  return token;
}
export async function approveLogin(database, token, adminEmail) {
  if (!isValidToken(token)) return null;
  const sessionToken = createToken();
  // DELETE RETURNING + INSERT нэг SQL үйлдэлд: холбоосыг зэрэг хоёр удаа ашиглаж болохгүй.
  const result = await database.query(
    `
    WITH approved AS (
      DELETE FROM admin_login_requests
      WHERE token_hash = $1 AND admin_email = $2 AND expires_at > now()
      RETURNING admin_email
    )
    INSERT INTO admin_sessions (token_hash, admin_email, expires_at)
    SELECT $3, admin_email, now() + interval '8 hours' FROM approved
    RETURNING token_hash`,
    [hashToken(token), adminEmail, hashToken(sessionToken)],
  );
  return result.rows.length === 1 ? sessionToken : null;
}
export async function validSession(database, token, adminEmail) {
  if (!isValidToken(token)) return false;
  const result = await database.query(
    `SELECT 1 FROM admin_sessions WHERE token_hash = $1 AND admin_email = $2 AND expires_at > now()`,
    [hashToken(token), adminEmail],
  );
  return result.rows.length === 1;
}
export async function revokeSession(database, token) {
  if (isValidToken(token))
    await database.query("DELETE FROM admin_sessions WHERE token_hash = $1", [
      hashToken(token),
    ]);
}
