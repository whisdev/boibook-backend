import routerx from "express-promise-router";
import { Validator, V } from "../../middlewares/validation";
import { checkUser, verifyToken } from "../../middlewares/auth";
import {
  changePassword,
  checkAddress,
  joinAddress,
  signinAddress,
  signin,
  signup,
  signout,
  info,
  forgot,
  passwordReset,
  getReferral,
} from "../../controllers/users";
const router = routerx();

router.post("/signin", V.body(Validator.Users.Auth.Signin), signin);
router.post("/signup", V.body(Validator.Users.Auth.Signup), signup);
router.post("/forgot", V.body(Validator.Users.Auth.Forgot), forgot);
router.post("/signout", V.body(Validator.UserId), signout);

router.post(
  "/a-check",
  V.body(Validator.Users.Auth.CheckAddress),
  checkAddress
);
router.post(
  "/a-signin",
  V.body(Validator.Users.Auth.SigninAddress),
  signinAddress
);
router.post(
  "/a-signup",
  V.body(Validator.Users.Auth.CheckAddress),
  joinAddress
);

router.post(
  "/r-password",
  V.body(Validator.Users.Auth.PasswordReset),
  passwordReset
);
router.post(
  "/c-password",
  V.body(Validator.Users.Auth.ChangePassword),
  verifyToken,
  checkUser,
  changePassword
);

router.post(
  "/info",
  V.body(Validator.Users.Auth.Info),
  verifyToken,
  checkUser,
  info
);
router.post(
  "/referral",
  V.body(Validator.UserId),
  verifyToken,
  checkUser,
  getReferral
);

export default router;
