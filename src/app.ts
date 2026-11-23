import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { env } from "./config/env.js";
import moduleRoutes from "./modules/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { noCache } from "./middleware/noCache.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { moduleDirname } from "./utils/dirname.js";
import { mimeTypeForLegacyUploadFilename } from "./utils/uploadMime.js";

const __dirname = moduleDirname(import.meta.url);
// Uploaded files and legacy Laravel images live here and are served at /uploads, with corrected Content-Type.
const UPLOADS_DIR = path.join(__dirname, "../uploads");

const app = express();

app.use(
  helmet({
    // Admin/website (e.g. :3002) load assets from API origin (:5000).
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
// Credentials (the admin cookie) require explicit origins; "*" is not allowed.
app.use(cors({ origin: env.corsOrigins, credentials: true }));
// sabko allow kerna hai testing ke liye, production me origin ko restrict karna hoga
// app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
// Parses the Cookie header into req.cookies (used for the admin session cookies).
app.use(cookieParser());
// API responses must never be cached by browsers or proxies.
app.use(noCache);
// After the body parsers so request bodies can be logged.
app.use(requestLogger);

app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    setHeaders(res, filePath) {
      const mime = mimeTypeForLegacyUploadFilename(path.basename(filePath));
      if (mime) {
        res.setHeader("Content-Type", mime);
      }
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

// Plain liveness probe (also used by the keep-alive ping).
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Must stay last: unmatched routes fall through to notFound, then errorHandler.
app.use("/api", moduleRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
