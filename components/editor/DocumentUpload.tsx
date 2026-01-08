"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, Trash2, Copy, Loader2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadDocument, listSiteDocuments, deleteDocument, type DocumentFile } from "@/app/actions/storage";
import { toast } from "sonner";

interface DocumentUploadProps {
  siteId: string;
  siteSlug: string;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DocumentUpload({
  siteId,
  siteSlug,
  disabled,
}: DocumentUploadProps): React.JSX.Element {
  // Build the friendly URL for a document
  const getFriendlyUrl = (doc: DocumentFile): string => {
    return `/sites/${siteSlug}/docs/${doc.slug}`;
  };
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents on mount
  useEffect(() => {
    async function loadDocuments(): Promise<void> {
      const result = await listSiteDocuments(siteId);
      if (result.success && result.documents) {
        setDocuments(result.documents);
      }
      setIsLoading(false);
    }
    loadDocuments();
  }, [siteId]);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress since FormData upload doesn't support progress
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 10, 90));
      }, 100);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("siteId", siteId);

      const result = await uploadDocument(formData);

      clearInterval(progressInterval);
      setIsUploading(false);

      if (result.success && result.url) {
        setUploadProgress(100);
        toast.success("Document uploaded successfully");
        // Refresh document list
        const listResult = await listSiteDocuments(siteId);
        if (listResult.success && listResult.documents) {
          setDocuments(listResult.documents);
        }
      } else {
        setError(result.error || "Upload failed");
        setUploadProgress(0);
      }
    },
    [siteId]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        await handleUpload(file);
      }
    },
    [disabled, handleUpload]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleUpload(file);
      }
      // Reset input so the same file can be selected again
      e.target.value = "";
    },
    [handleUpload]
  );

  const handleCopyUrl = useCallback(async (doc: DocumentFile) => {
    const friendlyUrl = getFriendlyUrl(doc);
    await navigator.clipboard.writeText(friendlyUrl);
    setCopiedId(doc.id);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  }, [siteSlug]);

  const handleDelete = useCallback(
    async (doc: DocumentFile) => {
      setDeletingId(doc.id);
      const result = await deleteDocument(doc.id);
      setDeletingId(null);

      if (result.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
        toast.success("Document deleted");
      } else {
        toast.error(result.error || "Failed to delete document");
      }
    },
    []
  );

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors text-center cursor-pointer",
          isDragging && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          !isDragging && "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {isUploading ? (
          <div className="space-y-2">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Uploading... {uploadProgress}%
            </p>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag & drop a PDF, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum file size: 10MB
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Documents List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Documents</h4>
          <div className="divide-y rounded-lg border">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3 hover:bg-muted/50 space-y-2"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-red-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.size)} &middot; {formatDate(doc.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                    >
                      <a
                        href={getFriendlyUrl(doc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc.id}
                      title="Delete"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {/* URL with copy button */}
                <div className="flex items-center gap-2 pl-8">
                  <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                    {getFriendlyUrl(doc)}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 shrink-0"
                    onClick={() => handleCopyUrl(doc)}
                  >
                    {copiedId === doc.id ? (
                      <>
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy URL
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          No documents uploaded yet
        </p>
      )}
    </div>
  );
}
