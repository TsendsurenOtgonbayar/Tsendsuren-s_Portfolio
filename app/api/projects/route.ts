import { listProjects, saveProject } from "@/lib/projects";
import { projectInputSchema } from "@/lib/project-validation";
import { isAdministrator, requireAdministrator } from "@/lib/server-auth";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const wantsDrafts = new URL(request.url).searchParams.get("admin") === "1";
    if (wantsDrafts && !(await isAdministrator()))
      return Response.json({ error: "forbidden" }, { status: 403 });
    return Response.json(await listProjects(wantsDrafts), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("List projects failed", error);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
export async function POST(request: Request) {
  const denied = await requireAdministrator(request);
  if (denied) return denied;
  try {
    const input = projectInputSchema.safeParse(await request.json());
    if (!input.success)
      return Response.json({ error: "invalid" }, { status: 400 });
    const id = await saveProject(input.data);
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Save project failed", error);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
