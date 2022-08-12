import routerx from "express-promise-router";
import { verifyAdminToken } from "../../middlewares/auth";
import { V, Validator } from "../../middlewares/validation";
import {
  getProfits,
  report,
  getUserProfit,
  removeTest,
  getBrackets,
  getCProfit,
  removeSports,
} from "../../controllers/reports";
const router = routerx();

router.post("/profit", getProfits);
router.post("/bracket", getBrackets);
router.post(
  "/user",
  V.body(Validator.Report.User),
  verifyAdminToken,
  getUserProfit
);
router.post("/", V.body(Validator.Report.Report), verifyAdminToken, report);
router.post("/r-all", V.body(Validator.UserId), verifyAdminToken, removeTest);
router.post(
  "/r-sports",
  V.body(Validator.UserId),
  verifyAdminToken,
  removeSports
);
router.post("/c-profit", getCProfit);

export default router;
