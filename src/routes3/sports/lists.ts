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
} from "../../controllers/sports/sportslists";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", V.body(Validator.Sports.Lists.Create), create);
router.post("/list", V.body(Validator.Sports.Lists.List), list);
router.post("/label", label);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Sports.Lists.Update),
  updateOne
);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
