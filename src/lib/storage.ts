import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_BASE_URL
  );
}

function r2Client() {
  const accountId = process.env.R2_ACCOUNT_ID!;
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function publicBaseUrl() {
  return String(process.env.R2_PUBLIC_BASE_URL || "").replace(/\/$/, "");
}

export async function putMedia(opts: {
  buffer: Buffer;
  filename: string;
  contentType: string;
  kind: "image" | "video";
}): Promise<{ url: string; provider: "r2" | "local" }> {
  const ext = path.extname(opts.filename) || (opts.kind === "video" ? ".mp4" : ".jpg");
  const key = `products/${opts.kind}/${nanoid()}${ext}`;

  if (isR2Configured()) {
    await r2Client().send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: opts.buffer,
        ContentType: opts.contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    return { url: `${publicBaseUrl()}/${key}`, provider: "r2" };
  }

  const localName = path.basename(key);
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, localName), opts.buffer);
  return { url: `/uploads/${localName}`, provider: "local" };
}
