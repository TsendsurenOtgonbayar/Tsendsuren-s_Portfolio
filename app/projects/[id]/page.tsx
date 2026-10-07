import { notFound } from "next/navigation";
import { findProject } from "@/lib/projects";
import { isAdministrator } from "@/lib/server-auth";
import { exampleProject } from "@/lib/project-types";
import ProjectArticle from "@/app/components/project-article";
export const dynamic = "force-dynamic";
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === exampleProject.id)
    return <ProjectArticle project={exampleProject} />;
  const project = await findProject(id, await isAdministrator());
  if (!project) notFound();
  return <ProjectArticle project={project} />;
}
