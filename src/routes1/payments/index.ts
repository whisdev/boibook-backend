import routerx from "express-promise-router";
import {
  getTransactionResult,
  getAdminBalance,
  getPaymentMethod,
} from "../../controllers/payment";
import { verifyAdminToken } from "../../middlewares/auth";
const router = routerx();

router.post("/getPaymentMethod", getPaymentMethod);
router.post("/getTransactionResult", getTransactionResult);
router.post("/getAdminBalance", verifyAdminToken, getAdminBalance);

export default router;
