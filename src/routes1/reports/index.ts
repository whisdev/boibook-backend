import routerx from "express-promise-router";
import { verifyAdminToken } from "../../middlewares/auth";
import { V, Validator } from "../../middlewares/validation";
import { getBrackets, getProfits, report } from "../../controllers/reports";
const router = routerx();

router.post("/profit", getProfits);
router.post("/bracket", getBrackets);
router.post("/", V.body(Validator.Report.Report), verifyAdminToken, report);

export default router;
