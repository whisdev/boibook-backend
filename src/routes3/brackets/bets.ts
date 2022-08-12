import routerx from "express-promise-router";
import { Validator, V } from "../../middlewares/validation";
import {
  create,
  deleteAll,
  deleteOne,
  get,
  getOne,
  list,
  updateOne,
  updateMany,
} from "../../controllers/brackets/bets";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", V.body(Validator.Brackets.Bets.Create), create);
router.post("/list", V.body(Validator.Brackets.Bets.List), list);
router.put("/", updateMany);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Brackets.Bets.Update),
  updateOne
);
router.delete("/", deleteAll);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
