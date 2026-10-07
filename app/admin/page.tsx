import { redirect } from "next/navigation";
import { isAdministrator } from "@/lib/server-auth";
import AdminEditor from "@/app/components/admin-editor";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  if (!(await isAdministrator())) redirect("/admin/login");
  return <AdminEditor />;
}
