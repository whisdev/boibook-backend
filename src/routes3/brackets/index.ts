import routerx from "express-promise-router";
import bet from "./bet";
import bets from "./bets";
import matchs from "./matchs";
import { verifyAdminToken } from "../../middlewares/auth";
const router = routerx();

router.use("/bets", verifyAdminToken, bets);
router.use("/matchs", verifyAdminToken, matchs);
router.use("/", bet);

export default router;
