import routerx from "express-promise-router";
import words from "./words";
import language from "./language";
import languages from "./languages";
import { verifyAdminToken } from "../../middlewares/auth";
const router = routerx();

router.use("/words", verifyAdminToken, words);
router.use("/languages", verifyAdminToken, languages);
router.use("/", verifyAdminToken, language);

export default router;
