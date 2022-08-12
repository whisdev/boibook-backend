import routerx from "express-promise-router";
import { Validator, V } from "../../middlewares/validation";
import {
  create,
  deleteOne,
  get,
  getOne,
  list,
  updateOne,
  label,
  csv,
} from "../../controllers/sports/sportsbets";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", V.body(Validator.Sports.Bets.Create), create);
router.post("/list", V.body(Validator.Sports.Bets.List), list);
router.post("/csv", V.body(Validator.Sports.Bets.List), csv);
router.post("/label", label);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Sports.Bets.Update),
  updateOne
);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
