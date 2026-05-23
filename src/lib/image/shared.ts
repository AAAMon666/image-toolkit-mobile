export type ToolTab = "compress" | "stitch" | "id-photo";

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDimensions(width: number, height: number) {
  return `${Math.round(width)} × ${Math.round(height)}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function timestampName(prefix: string, ext: string) {
  return `${prefix}-${new Date().toISOString().replace(/[:.]/g, "-")}.${ext}`;
}
