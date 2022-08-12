import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import { getLanguage, Word } from "../../controllers/languages";
const router = routerx();

router.post("/language", getLanguage);
router.post("/word", V.body(Validator.Languages.Language.ID), Word);

export default router;
