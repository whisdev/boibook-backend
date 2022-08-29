import routerx from "express-promise-router";
import rateLimit from "express-rate-limit";
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

// const loginLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000,
//   max: 10,
//   standardHeaders: true,
//   legacyHeaders: false,
// });

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
});

if (process.env.MODE === "dev") {
  router.post(
    "/signin",
    // loginLimiter,
    signin
  );
} else {
  router.post(
    "/signin",
    // loginLimiter,
    V.body(Validator.Users.Auth.Signin),
    signin
  );
}

router.post(
  "/signup",
  // loginLimiter,
  V.body(Validator.Users.Auth.Signup),
  signup
);
router.post(
  "/forgot",
  forgotLimiter,
  V.body(Validator.Users.Auth.Forgot),
  forgot
);
router.post("/signout", V.body(Validator.UserId), signout);

router.post(
  "/a-check",
  // loginLimiter,
  V.body(Validator.Users.Auth.CheckAddress),
  checkAddress
);
router.post(
  "/a-signin",
  // loginLimiter,
  V.body(Validator.Users.Auth.SigninAddress),
  signinAddress
);
router.post(
  "/a-signup",
  // loginLimiter,
  V.body(Validator.Users.Auth.SignupAddress),
  joinAddress
);

router.post(
  "/r-password",
  // loginLimiter,
  V.body(Validator.Users.Auth.PasswordReset),
  passwordReset
);
router.post(
  "/c-password",
  // loginLimiter,
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
