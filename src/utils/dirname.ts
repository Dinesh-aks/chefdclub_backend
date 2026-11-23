import path from "path";
import { fileURLToPath } from "url";

// ESM replacement for __dirname.
export function moduleDirname(importMetaUrl: string): string {
  return path.dirname(fileURLToPath(importMetaUrl));
}
