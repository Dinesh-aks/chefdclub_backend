/** Laravel legacy uploads often omit the dot before the extension (e.g. `foo123jpeg`). */
export function mimeTypeForLegacyUploadFilename(filename: string): string | undefined {
  const lower = filename.toLowerCase();
  if (lower.endsWith("jpeg") || lower.endsWith("jpg")) return "image/jpeg";
  if (lower.endsWith("png")) return "image/png";
  if (lower.endsWith("webp")) return "image/webp";
  if (lower.endsWith("gif")) return "image/gif";
  return undefined;
}
