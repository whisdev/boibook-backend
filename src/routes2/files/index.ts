import * as multer from "multer";
import rateLimit from "express-rate-limit";
import routerx from "express-promise-router";
import { verifyToken } from "../../middlewares/auth";
import { Validator, V } from "../../middlewares/validation";
import { upload, deleteURI } from "../../controllers/files";
import { fileFilter, storage, limits } from "../../middlewares/uploader";
const router = routerx();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/",
  limiter,
  verifyToken,
  multer({ storage, fileFilter, limits }).any(),
  upload
);
router.post(
  "/delete",
  limiter,
  V.body(Validator.Files.DeleteURI),
  verifyToken,
  deleteURI
);

export default router;
