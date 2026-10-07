import { redirect } from "next/navigation";
import { isAdministrator } from "@/lib/server-auth";
import LoginForm from "@/app/components/login-form";
export const dynamic = "force-dynamic";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdministrator()) redirect("/admin");
  return <LoginForm expired={(await searchParams).error === "expired"} />;
}
