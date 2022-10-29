// import rateLimit from "express-rate-limit";
import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import { checkUser, verifyToken } from "../../middlewares/auth";
import {
  getBalances,
  deposit,
  getCurrencies,
  addRemoveCurrency,
  useCurrency,
  withdrawal,
  getTransactions,
  depositSolana,
  cancelWithdrawal,
} from "../../controllers/payment";
const router = routerx();

// const limiter = rateLimit({
//   windowMs: 60 * 60 * 1000,
//   max: 5,
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// const depositlimiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 1,
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// const Mlimiter = rateLimit({
//   windowMs: 500,
//   max: 1,
//   standardHeaders: true,
//   legacyHeaders: false,
// });

router.post(
  "/deposit",
  V.body(Validator.Payments.Payment.Deposit),
  verifyToken,
  checkUser,
  deposit
);
router.post(
  "/m-deposit",
  // Mlimiter,
  // depositlimiter,
  V.body(Validator.Payments.Payment.SolanaDeposit),
  verifyToken,
  checkUser,
  depositSolana
);
router.post(
  "/withdrawal",
  // Mlimiter,
  // limiter,
  V.body(Validator.Payments.Payment.Withdrawal),
  verifyToken,
  checkUser,
  withdrawal
);
router.post(
  "/c-withdrawal",
  // Mlimiter,
  // limiter,
  V.body(Validator.Payments.Payment.CancelWithdrawal),
  verifyToken,
  checkUser,
  cancelWithdrawal
);
router.post(
  "/use-currency",
  V.body(Validator.Payments.Payment.Currency),
  verifyToken,
  checkUser,
  useCurrency
);
router.post("/get-currency", verifyToken, getCurrencies);
router.post(
  "/add-currency",
  V.body(Validator.Payments.Payment.Currency),
  verifyToken,
  checkUser,
  addRemoveCurrency
);
router.post(
  "/get-balance",
  V.body(Validator.UserId),
  verifyToken,
  checkUser,
  getBalances
);
router.post(
  "/get-transaction",
  V.body(Validator.UserId),
  verifyToken,
  checkUser,
  getTransactions
);

export default router;
