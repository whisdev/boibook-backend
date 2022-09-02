import routerx from "express-promise-router";
import { getAdminBalance, getPaymentMethod } from "../../controllers/payment";
import { verifyAdminToken } from "../../middlewares/auth";
const router = routerx();

router.post("/getPaymentMethod", getPaymentMethod);
router.post("/getAdminBalance", verifyAdminToken, getAdminBalance);

export default router;
