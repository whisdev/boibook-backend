import routerx from "express-promise-router";
import { Validator, V } from "../../middlewares/validation";
import {
  get,
  getOne,
  list,
  label,
  create,
  updateOne,
  deleteOne,
} from "../../controllers/users/permission";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", V.body(Validator.Users.Permission.Create), create);
router.post("/list", V.body(Validator.Users.Permission.List), list);
router.post("/label", V.body(Validator.Users.Permission.Update), label);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Users.Permission.Update),
  updateOne
);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
