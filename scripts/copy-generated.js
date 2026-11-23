import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = path.join(__dirname, "..", "src", "generated");
const dest = path.join(__dirname, "..", "dist", "generated");

fs.cpSync(src, dest, { recursive: true });
