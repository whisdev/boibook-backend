import routerx from "express-promise-router";
import { Validator, V } from "../../middlewares/validation";
import {
  deleteOne,
  get,
  getOne,
  list,
  updateOne,
  label,
  csv,
  signin,
  signup,
  signout,
  changePassword,
} from "../../controllers/users/admin";
const router = routerx();

router.post("/signin", V.body(Validator.Users.Admin.Signin), signin);
router.post("/signup", V.body(Validator.Users.Admin.Signup), signup);
router.post("/signout", V.body(Validator.UserId), signout);
router.post(
  "/changePassword",
  V.body(Validator.Users.Admin.ChangePassword),
  changePassword
);

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/list", V.body(Validator.Users.Admin.List), list);
router.post("/csv", V.body(Validator.Users.Admin.List), csv);
router.post("/label", label);
router.put("/:id", V.params(Validator.ObjectId), updateOne);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
