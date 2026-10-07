import { getDatabase } from "./database.mjs";
import type { Project } from "./project-types";
import type { ProjectInput } from "./project-validation";
// PostgreSQL нь camelCase alias-ийг хадгалахын тулд давхар хашилт шаарддаг.
const projectColumns = `id, title_mn AS "titleMn", title_en AS "titleEn", summary_mn AS "summaryMn", summary_en AS "summaryEn", content_mn AS "contentMn", content_en AS "contentEn", technologies, image_key AS "imageKey", github_url AS "githubUrl", demo_url AS "demoUrl", published, created_at AS "createdAt", updated_at AS "updatedAt"`;
export async function listProjects(includeDrafts = false): Promise<Project[]> {
  const result = await getDatabase().query(
    `SELECT ${projectColumns} FROM projects ${includeDrafts ? "" : "WHERE published = 1"} ORDER BY created_at DESC`,
  );
  return result.rows;
}
export async function findProject(
  id: string,
  includeDrafts = false,
): Promise<Project | null> {
  const result = await getDatabase().query(
    `SELECT ${projectColumns} FROM projects WHERE id = $1 ${includeDrafts ? "" : "AND published = 1"}`,
    [id],
  );
  return result.rows[0] || null;
}
export async function deleteProject(id: string) {
  await getDatabase().query("DELETE FROM projects WHERE id = $1", [id]);
}
export async function isPublishedImage(key: string) {
  const result = await getDatabase().query(
    "SELECT id FROM projects WHERE image_key = $1 AND published = 1 LIMIT 1",
    [key],
  );
  return result.rows.length > 0;
}
export async function saveProject(input: ProjectInput, id?: string) {
  const projectId = id || crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const values = [
    input.titleMn,
    input.titleEn,
    input.summaryMn,
    input.summaryEn,
    input.contentMn,
    input.contentEn,
    input.technologies,
    input.imageKey,
    input.githubUrl,
    input.demoUrl,
    input.published,
  ];
  if (id) {
    await getDatabase().query(
      `UPDATE projects SET title_mn=$1,title_en=$2,summary_mn=$3,summary_en=$4,content_mn=$5,content_en=$6,technologies=$7,image_key=$8,github_url=$9,demo_url=$10,published=$11,updated_at=$12 WHERE id=$13`,
      [...values, timestamp, id],
    );
  } else {
    await getDatabase().query(
      `INSERT INTO projects (title_mn,title_en,summary_mn,summary_en,content_mn,content_en,technologies,image_key,github_url,demo_url,published,updated_at,id,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [...values, timestamp, projectId, timestamp],
    );
  }
  return projectId;
}
