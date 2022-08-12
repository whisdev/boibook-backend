import routerx from "express-promise-router";
import auth from "./auth";
import admin from "./admin";
import history from "./history";
import session from "./session";
import permission from "./permission";
import { verifyAdminToken } from "../../middlewares/auth";
const router = routerx();

router.use("/", auth);
router.use("/admin", verifyAdminToken, admin);
router.use("/permission", verifyAdminToken, permission);
router.use("/session", verifyAdminToken, session);
router.use("/history", verifyAdminToken, history);

export default router;
