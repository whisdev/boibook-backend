import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import {
  create,
  deleteOne,
  get,
  getOne,
  update,
  updateMany,
} from "../../controllers/languages/words";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", create);
router.put("/", updateMany);
router.put("/:id", V.params(Validator.ObjectId), update);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
