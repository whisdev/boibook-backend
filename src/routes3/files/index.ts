import routerx from "express-promise-router";
import * as multer from "multer";
import { verifyToken } from "../../middlewares/auth";
import { Validator, V } from "../../middlewares/validation";
import { upload, deleteURI } from "../../controllers/files";
import { fileFilter, storage, limits } from "../../middlewares/uploader";
const router = routerx();

router.post(
  "/",
  verifyToken,
  multer({ storage, fileFilter, limits }).any(),
  upload
);
router.post(
  "/delete",
  V.body(Validator.Files.DeleteURI),
  verifyToken,
  deleteURI
);

export default router;
