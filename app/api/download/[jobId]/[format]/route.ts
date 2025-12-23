import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import archiver from "archiver";
import { requireUserId } from "@/lib/auth";
import { getTranscriptByJobId } from "@/lib/transcripts";

interface RouteParams {
  params: Promise<{
    jobId: string;
    format: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { jobId, format } = await params;
    const userId = await requireUserId();

    const data = await getTranscriptByJobId(jobId, userId);

    if (!data) {
      return NextResponse.json(
        { error: "Transcript not found" },
        { status: 404 }
      );
    }

    if (format === "all") {
      return handleZipDownload(data, data.job.file_name);
    }

    return handleSingleFormatDownload(data, format, data.job.file_name);
  } catch (error) {
    logger.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download transcript" },
      { status: 500 }
    );
  }
}

function handleSingleFormatDownload(
  data: Awaited<ReturnType<typeof getTranscriptByJobId>>,
  format: string,
  fileName: string
) {
  if (!data) {
    return NextResponse.json(
      { error: "Transcript not found" },
      { status: 404 }
    );
  }

  const validFormats = ["txt", "srt", "vtt", "json", "verbose_json"];
  if (!validFormats.includes(format)) {
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }

  let content: string;
  let contentType: string;
  let extension: string;

  switch (format) {
    case "txt":
      content = data.transcript.transcript_text_plain;
      contentType = "text/plain";
      extension = "txt";
      break;
    case "srt":
      content = data.transcript.transcript_srt;
      contentType = "text/srt";
      extension = "srt";
      break;
    case "vtt":
      content = data.transcript.transcript_vtt;
      contentType = "text/vtt";
      extension = "vtt";
      break;
    case "json":
      content = JSON.stringify(data.transcript.transcript_json, null, 2);
      contentType = "application/json";
      extension = "json";
      break;
    case "verbose_json":
      content = JSON.stringify(
        data.transcript.transcript_verbose_json,
        null,
        2
      );
      contentType = "application/json";
      extension = "json";
      break;
    default:
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }

  const baseFileName = fileName.replace(/\.[^/.]+$/, "");
  const downloadFileName = `${baseFileName}.${extension}`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${downloadFileName}"`,
    },
  });
}

async function handleZipDownload(
  data: Awaited<ReturnType<typeof getTranscriptByJobId>>,
  fileName: string
) {
  if (!data) {
    return NextResponse.json(
      { error: "Transcript not found" },
      { status: 404 }
    );
  }

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  const stream = new ReadableStream({
    start(controller) {
      archive.on("data", (chunk: Buffer) => {
        controller.enqueue(chunk);
      });

      archive.on("end", () => {
        controller.close();
      });

      archive.on("error", (err: Error) => {
        controller.error(err);
      });

      const baseFileName = fileName.replace(/\.[^/.]+$/, "");

      // Add all formats to the ZIP
      archive.append(data.transcript.transcript_text_plain, {
        name: `${baseFileName}.txt`,
      });

      archive.append(data.transcript.transcript_srt, {
        name: `${baseFileName}.srt`,
      });

      archive.append(data.transcript.transcript_vtt, {
        name: `${baseFileName}.vtt`,
      });

      archive.append(
        JSON.stringify(data.transcript.transcript_json, null, 2),
        {
          name: `${baseFileName}.json`,
        }
      );

      if (data.transcript.transcript_verbose_json) {
        archive.append(
          JSON.stringify(data.transcript.transcript_verbose_json, null, 2),
          {
            name: `${baseFileName}-verbose.json`,
          }
        );
      }

      archive.finalize();
    },
  });

  const downloadFileName = `${fileName.replace(/\.[^/.]+$/, "")}-transcripts.zip`;

  return new NextResponse(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${downloadFileName}"`,
    },
  });
}
