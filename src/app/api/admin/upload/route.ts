import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { putMedia } from "@/lib/storage";
import {
  getVideoDurationFromBuffer,
  isVideoDurationAllowed,
  videoDurationError,
} from "@/lib/video-duration";

const MAX_BYTES = 50 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const kind = String(formData.get("kind") || "image");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "El archivo supera 50 MB" },
      { status: 400 }
    );
  }

  const allowed = kind === "video" ? VIDEO_TYPES : IMAGE_TYPES;
  if (!allowed.has(file.type)) {
    return NextResponse.json(
      { error: "Tipo de archivo no permitido" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (kind === "video") {
    const clientDuration = Number(formData.get("duration"));
    const parsedDuration = getVideoDurationFromBuffer(buffer, file.type);
    const duration = parsedDuration ?? clientDuration;

    if (!isVideoDurationAllowed(duration)) {
      return NextResponse.json({ error: videoDurationError() }, { status: 400 });
    }

    if (
      parsedDuration != null &&
      Number.isFinite(clientDuration) &&
      Math.abs(parsedDuration - clientDuration) > 2
    ) {
      return NextResponse.json(
        { error: "La duración del video no coincide con el archivo." },
        { status: 400 }
      );
    }
  }

  const ext = path.extname(file.name) || (kind === "video" ? ".mp4" : ".jpg");
  const stored = await putMedia({
    buffer,
    filename: `${kind}${ext}`,
    contentType: file.type,
    kind: kind === "video" ? "video" : "image",
  });

  return NextResponse.json({ url: stored.url, provider: stored.provider });
}
