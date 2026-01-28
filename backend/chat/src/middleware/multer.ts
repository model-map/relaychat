import multer, { Multer } from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "temp/");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload: Multer = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5MB file size
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Multer error: Only images allowed"));
    }
  },
});
