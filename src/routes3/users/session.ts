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
  csv,
} from "../../controllers/users/session";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", V.body(Validator.Users.Session.Create), create);
router.post("/list", V.body(Validator.Users.Session.List), list);
router.post("/csv", V.body(Validator.Users.Session.List), csv);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Users.Session.Update),
  updateOne
);
router.delete("/", deleteAll);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
