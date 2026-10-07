import { findProject, saveProject, deleteProject } from "@/lib/projects";
import { projectInputSchema } from "@/lib/project-validation";
import { requireAdministrator } from "@/lib/server-auth";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function PUT(request: Request, context: Context) {
  const denied = await requireAdministrator(request);
  if (denied) return denied;
  try {
    const { id } = await context.params;
    if (!(await findProject(id, true)))
      return Response.json({ error: "not_found" }, { status: 404 });
    const input = projectInputSchema.safeParse(await request.json());
    if (!input.success)
      return Response.json({ error: "invalid" }, { status: 400 });
    await saveProject(input.data, id);
    return Response.json({ id });
  } catch (error) {
    console.error("Update failed", error);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
export async function DELETE(request: Request, context: Context) {
  const denied = await requireAdministrator(request);
  if (denied) return denied;
  try {
    const { id } = await context.params;
    await deleteProject(id);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Delete failed", error);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
