import multer, { Multer } from "multer";

const storage = multer.memoryStorage();
export const upload: Multer = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Multer error: Only images allowed"));
    }
  },
});
