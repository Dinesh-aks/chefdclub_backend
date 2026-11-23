import { NextFunction, Request, Response, Router } from "express";
import { requireAdminAuth } from "../../middleware/requireAdminAuth.js";
import {
  journalInlineImageResponse,
  requireJournalInlinePostId,
  uploadJournalInlineImage,
} from "../../middleware/journal-upload.js";
import { uploadEditorImage } from "../../middleware/upload.js";
import { AppError } from "../../utils/AppError.js";
import { sendSuccess } from "../../utils/apiResponse.js";

const router = Router();

// Builds the handler that returns the relative `/uploads/...` URL of the saved editor image.
function editorImageResponse(subdir: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.file) {
      next(new AppError("Image is required", 400));
      return;
    }
    sendSuccess(res, { url: `/uploads/${subdir}/${req.file.filename}` }, "Image uploaded", 201);
  };
}

// Saves an image from the rich text editor (FAQ, pages) under uploads/cms/editor.
router.post("/editor-image", requireAdminAuth, uploadEditorImage, editorImageResponse("cms/editor"));

// Journal body images: `?postId=` required; saved under uploads/cms/blog/posts/<id>/inline/.
router.post(
  "/editor-image/journal",
  requireAdminAuth,
  requireJournalInlinePostId,
  uploadJournalInlineImage,
  journalInlineImageResponse
);

export default router;
