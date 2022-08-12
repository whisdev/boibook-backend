import routerx from "express-promise-router";
import { Validator, V } from "../../middlewares/validation";
import {
  create,
  deleteOne,
  get,
  getOne,
  list,
  updateOne,
  csv,
} from "../../controllers/users/history";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", V.body(Validator.Users.LoginHistory.Create), create);
router.post("/list", V.body(Validator.Users.LoginHistory.List), list);
router.post("/csv", V.body(Validator.Users.LoginHistory.List), csv);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Users.LoginHistory.Update),
  updateOne
);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
