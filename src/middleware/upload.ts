import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";
import { AppError } from "../utils/AppError.js";
import { moduleDirname } from "../utils/dirname.js";

const __dirname = moduleDirname(import.meta.url);

// Upload limits: JPEG/PNG/WEBP only, max 5 MB.
const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

// Stores files on disk under uploads/<subdir> with a unique timestamped name.
function createImageStorage(subdir: string) {
  const dir = path.join(__dirname, `../../uploads/${subdir}`);
  return multer.diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, dir);
    },
    filename: (_req, file, callback) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = crypto.randomUUID().slice(0, 8);
      callback(null, `${Date.now()}-${uniqueSuffix}${ext}`);
    },
  });
}

// Rejects non-image uploads before they are written to disk.
function imageFileFilter(
  _req: unknown,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    callback(new AppError("Image must be JPEG, PNG, or WEBP", 400));
    return;
  }
  callback(null, true);
}

function createUploader(subdir: string) {
  return multer({
    storage: createImageStorage(subdir),
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
    fileFilter: imageFileFilter,
  });
}

// One uploader per feature, each writing to its own uploads subfolder.
export const uploadGalleryPhoto = createUploader("gallery/photos").single("image");

export const uploadCmsPageBanner = createUploader("cms/pages").single("banner");
export const uploadHighlightImage = createUploader("cms/highlights").single("image");
export const uploadMenuCategoryImages = createUploader("cms/menu-categories").fields([
  { name: "image", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);
export const uploadMenuCardBanner = createUploader("cms/menu-cards").single("banner");

fs.mkdirSync(path.join(__dirname, "../../uploads/cms/spotlight"), { recursive: true });
export const uploadSpotlightImage = createUploader("cms/spotlight").single("image");

// Admin profile photo, saved under uploads/admin.
fs.mkdirSync(path.join(__dirname, "../../uploads/admin"), { recursive: true });
export const uploadAdminProfileImage = createUploader("admin").single("image");

// Images dropped or pasted into the rich text editor. The field name is `upload` (CKEditor's default).
fs.mkdirSync(path.join(__dirname, "../../uploads/cms/editor"), { recursive: true });
export const uploadEditorImage = createUploader("cms/editor").single("upload");
