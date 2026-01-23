import {
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image,
  Video,
  Music,
  File,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DownloadFileType } from "./section-types";

/**
 * Configuration for each file type icon
 */
interface FileTypeConfig {
  icon: LucideIcon;
  color: string;
  label: string;
}

const FILE_TYPE_CONFIG: Record<DownloadFileType, FileTypeConfig> = {
  pdf: { icon: FileText, color: "#DC2626", label: "PDF" },
  doc: { icon: FileText, color: "#2563EB", label: "Document" },
  xls: { icon: FileSpreadsheet, color: "#16A34A", label: "Spreadsheet" },
  zip: { icon: FileArchive, color: "#EA580C", label: "Archive" },
  img: { icon: Image, color: "#7C3AED", label: "Image" },
  video: { icon: Video, color: "#DB2777", label: "Video" },
  audio: { icon: Music, color: "#0891B2", label: "Audio" },
  other: { icon: File, color: "#6B7280", label: "File" },
};

/**
 * Extension to file type mapping
 */
const EXTENSION_MAP: Record<string, DownloadFileType> = {
  // Documents
  pdf: "pdf",
  doc: "doc",
  docx: "doc",
  odt: "doc",
  rtf: "doc",
  txt: "doc",
  // Spreadsheets
  xls: "xls",
  xlsx: "xls",
  csv: "xls",
  ods: "xls",
  // Archives
  zip: "zip",
  rar: "zip",
  "7z": "zip",
  tar: "zip",
  gz: "zip",
  // Images
  jpg: "img",
  jpeg: "img",
  png: "img",
  gif: "img",
  webp: "img",
  svg: "img",
  bmp: "img",
  ico: "img",
  // Video
  mp4: "video",
  mov: "video",
  avi: "video",
  webm: "video",
  mkv: "video",
  wmv: "video",
  // Audio
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  flac: "audio",
  aac: "audio",
  m4a: "audio",
};

/**
 * Get the file type from a URL or filename
 */
export function getFileTypeFromUrl(url: string): DownloadFileType {
  if (!url) return "other";

  // Extract extension from URL (handle query strings)
  const pathname = url.split("?")[0];
  const ext = pathname.split(".").pop()?.toLowerCase() || "";

  return EXTENSION_MAP[ext] || "other";
}

/**
 * Get the file type config (icon, color, label)
 */
export function getFileTypeConfig(type: DownloadFileType): FileTypeConfig {
  return FILE_TYPE_CONFIG[type];
}

/**
 * File icon component
 */
export function FileIcon({
  type,
  size = 24,
  className,
}: {
  type: DownloadFileType;
  size?: number;
  className?: string;
}) {
  const config = FILE_TYPE_CONFIG[type];
  const Icon = config.icon;

  return <Icon size={size} style={{ color: config.color }} className={className} />;
}

/**
 * Get the label for a file type
 */
export function getFileTypeLabel(type: DownloadFileType): string {
  return FILE_TYPE_CONFIG[type].label;
}
