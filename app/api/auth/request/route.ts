import { Resend } from "resend";
import { getDatabase } from "@/lib/database.mjs";
import {
  createLoginRequest,
  getAdminEmail,
  getAppOrigin,
  hashToken,
  reserveEmailSlot,
  sameOrigin,
} from "@/lib/auth-core.mjs";
export const runtime = "nodejs";
export async function POST(request: Request) {
  let token: string | undefined;
  try {
    if (!sameOrigin(request))
      return Response.json({ error: "forbidden" }, { status: 403 });
    const adminEmail = getAdminEmail();
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)
      return Response.json({ error: "not_configured" }, { status: 503 });
    const database = getDatabase();
    if (!(await reserveEmailSlot(database, adminEmail)))
      return Response.json(
        { error: "rate_limited" },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    token = await createLoginRequest(database, adminEmail);
    const approvalLink = `${getAppOrigin()}/admin/approve?token=${token}`;
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.EMAIL_FROM,
      to: adminEmail, // Browser-оос хүлээн авагч авдаггүй. Зөвхөн эзэмшигчийн имэйл.
      subject: "Tsendsuren — Админ нэвтрэлтийг зөвшөөрөх / Approve sign-in",
      text: `Таны портфолионы админд нэвтрэх хүсэлт ирлээ.\n\nӨөрөө хүсэлт гаргасан бол доорх холбоосыг нээгээд “Зөвшөөрч нэвтрэх” товчийг дарна уу:\n${approvalLink}\n\nХолбоос 10 минутын хугацаатай, нэг удаа ашиглагдана. Хүсэлт гаргаагүй бол энэ имэйлийг үл тооно уу. Холбоосыг бусдад дамжуулж болохгүй.\n\nOpen the link and confirm only if you requested this sign-in. It signs in the browser in which you open it. The link expires in 10 minutes and works once. Ignore unexpected requests.`,
    });
    if (error) throw new Error("email_failed");
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    if (token) {
      try {
        await getDatabase().query(
          "DELETE FROM admin_login_requests WHERE token_hash = $1",
          [hashToken(token)],
        );
      } catch {}
    }
    // Имэйлийн холбоос, нууц түлхүүрийг лог болон хариунд буцаахгүй.
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
