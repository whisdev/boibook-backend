import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import {
  deleteWord,
  getLanguage,
  getWord,
  getWords,
  updateWord,
  updateWords,
  Word,
} from "../../controllers/languages";
const router = routerx();

router.post("/language", getLanguage);
router.post("/word", V.body(Validator.Languages.Language.ID), Word);
router.get("/", getWords);
router.get("/:id", V.params(Validator.Languages.Language.ID), getWord);
router.put("/all", updateWords);
router.put("/:id", V.params(Validator.Languages.Language.ID), updateWord);
router.delete("/:id", V.params(Validator.Languages.Language.ID), deleteWord);

export default router;
