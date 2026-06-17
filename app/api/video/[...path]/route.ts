import { promises as fs, createReadStream } from "fs";
import pathModule from "path";
import { Readable } from "stream";
import type { NextRequest } from "next/server";

const mimeTypes: Record<string, string> = {
  ".avi": "video/x-msvideo",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4"
};

function toSafePath(segments: string[]) {
  const videosRoot = pathModule.join(process.cwd(), "videos");
  const decodedSegments = segments.map((segment) => decodeURIComponent(segment));
  const filePath = pathModule.join(videosRoot, ...decodedSegments);
  const relativePath = pathModule.relative(videosRoot, filePath);

  if (relativePath.startsWith("..") || pathModule.isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const filePath = toSafePath(path);

  if (!filePath) {
    return new Response("Invalid video path", { status: 403 });
  }

  try {
    const stat = await fs.stat(filePath);
    const fileSize = stat.size;
    const extension = pathModule.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] ?? "application/octet-stream";
    const range = request.headers.get("range");

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = Number.parseInt(parts[0] || "0", 10);
      const end = parts[1] ? Number.parseInt(parts[1], 10) : fileSize - 1;

      if (Number.isNaN(start) || Number.isNaN(end) || start > end) {
        return new Response("Invalid range", { status: 416 });
      }

      const chunkSize = end - start + 1;
      const stream = createReadStream(filePath, { start, end });

      return new Response(Readable.toWeb(stream) as BodyInit, {
        status: 206,
        headers: {
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Content-Type": contentType
        }
      });
    }

    const stream = createReadStream(filePath);

    return new Response(Readable.toWeb(stream) as BodyInit, {
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": String(fileSize),
        "Content-Type": contentType
      }
    });
  } catch {
    return new Response("Video not found", { status: 404 });
  }
}
