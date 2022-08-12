import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import {
  create,
  deleteOne,
  get,
  getOne,
  list,
  updateOne,
  csv,
} from "../../controllers/games/games";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", V.body(Validator.Games.Games.Create), create);
router.post("/list", V.body(Validator.Games.Games.List), list);
router.post("/csv", V.body(Validator.Games.Games.List), csv);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Games.Games.Update),
  updateOne
);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
