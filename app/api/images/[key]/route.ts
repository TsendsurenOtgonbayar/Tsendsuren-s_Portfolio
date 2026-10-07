import { get } from "@vercel/blob";
import { isPublishedImage } from "@/lib/projects";
import { isAdministrator } from "@/lib/server-auth";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await params;
    if (!/^[a-f0-9-]{36}\.(png|jpg|webp)$/.test(key))
      return new Response("Not found", { status: 404 });
    if (!(await isPublishedImage(key)) && !(await isAdministrator()))
      return new Response("Not found", { status: 404 });
    const image = await get(key, { access: "private" });
    if (!image || image.statusCode !== 200)
      return new Response("Not found", { status: 404 });
    return new Response(image.stream, {
      headers: {
        "Content-Type": image.blob.contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
}
