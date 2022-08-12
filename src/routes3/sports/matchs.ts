import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import {
  create,
  deleteOne,
  get,
  getOne,
  list,
  updateOne,
} from "../../controllers/sports/sportsmatchs";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", V.body(Validator.Sports.Matchs.Create), create);
router.post("/list", V.body(Validator.Sports.Matchs.List), list);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Sports.Matchs.Update),
  updateOne
);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
