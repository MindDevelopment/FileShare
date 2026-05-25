import multer from "multer";
import path from "path";
import { Request } from "express";
import { UPLOAD_DIR } from "../config";
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const allowedExtensions = [".zip", ".rar", ".7z", ".exe", ".appimage", ".deb", ".tar.gz", ".tar", ".gz"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File extension ${ext} is not allowed`));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
