import { put } from "@vercel/blob";
import { requireAdministrator } from "@/lib/server-auth";
export async function POST(request: Request) {
  const denied = await requireAdministrator(request);
  if (denied) return denied;
  if (Number(request.headers.get("content-length")) > 4.2 * 1024 * 1024)
    return Response.json({ error: "image_too_large" }, { status: 413 });
  try {
    const form = await request.formData();
    const file = form.get("image");
    if (
      !(file instanceof File) ||
      file.size > 4 * 1024 * 1024 ||
      file.size === 0
    )
      return Response.json({ error: "invalid_image" }, { status: 400 });
    const imageBytes = new Uint8Array(await file.arrayBuffer());
    const isPng =
      imageBytes[0] === 137 &&
      imageBytes[1] === 80 &&
      imageBytes[2] === 78 &&
      imageBytes[3] === 71;
    const isJpeg =
      imageBytes[0] === 255 && imageBytes[1] === 216 && imageBytes[2] === 255;
    const isWebp =
      String.fromCharCode(...imageBytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...imageBytes.slice(8, 12)) === "WEBP";
    const extension = isPng ? "png" : isJpeg ? "jpg" : isWebp ? "webp" : null;
    if (!extension)
      return Response.json({ error: "invalid_image" }, { status: 400 });
    const key = `${crypto.randomUUID()}.${extension}`;
    await put(key, Buffer.from(imageBytes), {
      access: "private",
      addRandomSuffix: false,
      contentType: `image/${extension === "jpg" ? "jpeg" : extension}`,
    });
    return Response.json({ key }, { status: 201 });
  } catch (error) {
    console.error("Upload failed", error);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
