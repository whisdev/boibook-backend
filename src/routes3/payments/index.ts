import routerx from "express-promise-router";
import payment from "./payment";
import payments from "./payments";
import currency from "./currency";
import balances from "./balances";
import balancehistory from "./balancehistory";
import { verifyAdminToken } from "../../middlewares/auth";
const router = routerx();

router.use("/", payment);
router.use("/payments", verifyAdminToken, payments);
router.use("/currency", verifyAdminToken, currency);
router.use("/balances", verifyAdminToken, balances);
router.use("/balancehistory", verifyAdminToken, balancehistory);

export default router;
