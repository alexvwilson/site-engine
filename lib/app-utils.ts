/** Client-safe constants used across the app */

/** Media upload constraints for audio/video transcription files */
export const MEDIA_UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE: 2048 * 1024 * 1024, // 2GB max file size
  MAX_BATCH_UPLOAD_SIZE: 5, // Maximum number of files per batch upload
  ALLOWED_MIME_TYPES: [
    "audio/mpeg", // MP3
    "audio/mp4", // M4A
    "audio/wav", // WAV
    "video/mp4", // MP4
    "video/quicktime", // MOV
  ] as readonly string[],
  ALLOWED_EXTENSIONS: ["mp3", "mp4", "wav", "mov", "m4a"] as readonly string[],
  BUCKET_NAME: "media-uploads",
  UPLOAD_URL_EXPIRATION: 60 * 60, // 1 hour for upload signed URLs
  DOWNLOAD_URL_EXPIRATION: 24 * 60 * 60, // 24 hours for download signed URLs
} as const;
