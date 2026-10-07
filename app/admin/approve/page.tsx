import ApprovalForm from "@/app/components/approval-form";
import { isValidToken } from "@/lib/auth-core.mjs";
export const dynamic = "force-dynamic";
// GET зөвхөн баталгаажуулах дэлгэц харуулна. Имэйл scanner холбоосыг хэрэглэхгүй.
export default async function ApprovalPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token;
  return <ApprovalForm token={isValidToken(token) ? token! : ""} />;
}
