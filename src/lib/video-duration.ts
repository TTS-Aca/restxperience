export const VIDEO_MIN_SECONDS = 15;
export const VIDEO_MAX_SECONDS = 35;

export function isVideoDurationAllowed(seconds: number): boolean {
  return (
    Number.isFinite(seconds) &&
    seconds >= VIDEO_MIN_SECONDS &&
    seconds <= VIDEO_MAX_SECONDS
  );
}

export function videoDurationError(): string {
  return `El video debe durar entre ${VIDEO_MIN_SECONDS} y ${VIDEO_MAX_SECONDS} segundos.`;
}

/** Client-side: read duration from a File via object URL. */
export function getVideoDurationFromFile(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("No se pudo leer la duración del video."));
        return;
      }
      resolve(duration);
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("No se pudo leer el archivo de video."));
    };

    video.src = url;
  });
}

/** Server-side: parse MP4/MOV duration from mvhd atom. */
export function getMp4DurationSeconds(buffer: Buffer): number | null {
  const mvhd = findAtom(buffer, "mvhd");
  if (!mvhd || mvhd.length < 32) return null;

  const version = mvhd[8];
  if (version === 0) {
    const timescale = mvhd.readUInt32BE(20);
    const duration = mvhd.readUInt32BE(24);
    if (!timescale) return null;
    return duration / timescale;
  }
  if (version === 1 && mvhd.length >= 44) {
    const timescale = mvhd.readUInt32BE(28);
    const durationHi = mvhd.readUInt32BE(32);
    const durationLo = mvhd.readUInt32BE(36);
    if (!timescale) return null;
    return (durationHi * 2 ** 32 + durationLo) / timescale;
  }
  return null;
}

const CONTAINER_ATOMS = new Set([
  "moov",
  "trak",
  "mdia",
  "minf",
  "stbl",
  "edts",
]);

function findAtom(buffer: Buffer, target: string): Buffer | null {
  return scanAtoms(buffer, 0, buffer.length, target);
}

function scanAtoms(
  buffer: Buffer,
  start: number,
  end: number,
  target: string
): Buffer | null {
  let offset = start;
  while (offset + 8 <= end) {
    let size = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    let header = 8;

    if (size === 1 && offset + 16 <= end) {
      size = Number(buffer.readBigUInt64BE(offset + 8));
      header = 16;
    }

    if (size < header) break;

    const atomEnd = Math.min(offset + size, end);
    const contentStart = offset + header;

    if (type === target) {
      return buffer.subarray(offset, atomEnd);
    }

    if (CONTAINER_ATOMS.has(type)) {
      const found = scanAtoms(buffer, contentStart, atomEnd, target);
      if (found) return found;
    }

    offset += size;
  }
  return null;
}

export function getVideoDurationFromBuffer(
  buffer: Buffer,
  mime: string
): number | null {
  if (mime === "video/mp4" || mime === "video/quicktime") {
    return getMp4DurationSeconds(buffer);
  }
  return null;
}
