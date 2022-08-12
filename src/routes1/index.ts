import routerx from "express-promise-router";
import sports from "./sports";
import reports from "./reports";
import payments from "./payments";
import languages from "./languages";

const router = routerx();
router.use("/sports", sports);
router.use("/reports", reports);
router.use("/payments", payments);
router.use("/languages", languages);

export default router;
