import * as path from "path";
import * as multer from "multer";
const config = require("../../config");

export const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: Function) => {
    cb(null, path.join(`${config.DIR}/upload/`));
  },
  filename: (req: any, file: any, cb: Function) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

export const fileFilter = (req: any, file: any, callback: Function) => {
  const ext = path.extname(file.originalname);
  const fileTypes = [".png", ".jpg", ".gif", ".jpeg", ".jfif", ".webp", ".svg"];
  if (fileTypes.indexOf(ext) === -1) {
    return callback(new Error("Only images are allowed"));
  }
  callback(null, true);
};

export const limits = { fileSize: 1024 * 1024 };
