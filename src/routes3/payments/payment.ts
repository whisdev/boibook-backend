import routerx from "express-promise-router";
import {
  verifyAdminToken,
  checkUser,
  verifyToken,
} from "../../middlewares/auth";
import {
  getBalances,
  deposit,
  getCurrencies,
  getTransactionResult,
  addRemoveCurrency,
  useCurrency,
  withdrawal,
  getTransactions,
  depositSolana,
  updateBalance,
  getAdminBalance,
  cancelWithdrawal,
  getPaymentMethod,
} from "../../controllers/payment";
import { V, Validator } from "../../middlewares/validation";
const router = routerx();

router.post("/getPaymentMethod", getPaymentMethod);
router.post("/getTransactionResult", getTransactionResult);
router.post("/getAdminBalance", verifyAdminToken, getAdminBalance);

router.post(
  "/deposit",
  V.body(Validator.Payments.Payment.Deposit),
  verifyToken,
  checkUser,
  deposit
);
router.post(
  "/m-deposit",
  V.body(Validator.Payments.Payment.SolanaDeposit),
  verifyToken,
  checkUser,
  depositSolana
);
router.post(
  "/withdrawal",
  V.body(Validator.Payments.Payment.Withdrawal),
  verifyToken,
  checkUser,
  withdrawal
);
router.post(
  "/c-withdrawal",
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

router.post(
  "/updateBalance",
  V.body(Validator.Payments.Payment.UpdateBalance),
  verifyAdminToken,
  updateBalance
);

export default router;
