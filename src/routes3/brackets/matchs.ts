import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import {
  get,
  getOne,
  list,
  create,
  update,
  deleteOne,
  deleteAll,
} from "../../controllers/brackets/matchs";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", V.body(Validator.Brackets.Matchs.Create), create);
router.post("/list", V.body(Validator.Brackets.Matchs.List), list);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Brackets.Matchs.Update),
  update
);
router.delete("/", deleteAll);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
