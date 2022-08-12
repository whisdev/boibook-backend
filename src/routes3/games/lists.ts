import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import {
  create,
  deleteOne,
  get,
  getOne,
  list,
  updateOne,
  updateMany,
  label,
} from "../../controllers/games/lists";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", V.body(Validator.Games.Lists.Create), create);
router.post("/list", V.body(Validator.Games.Lists.List), list);
router.post("/label", label);
router.put("/", updateMany);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Games.Lists.Update),
  updateOne
);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
