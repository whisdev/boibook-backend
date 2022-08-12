import routerx from "express-promise-router";
import bet from "./bet";
import bets from "./bets";
import lists from "./lists";
import matchs from "./matchs";
import leagues from "./leagues";
import bettings from "./bettings";
import fixmatchs from "./fixmatchs";
import endmatchs from "./endmatchs";
import { verifyAdminToken } from "../../middlewares/auth";
const router = routerx();

router.use("/bets", verifyAdminToken, bets);
router.use("/lists", verifyAdminToken, lists);
router.use("/matchs", verifyAdminToken, matchs);
router.use("/leagues", verifyAdminToken, leagues);
router.use("/bettings", verifyAdminToken, bettings);
router.use("/fixmatchs", verifyAdminToken, fixmatchs);
router.use("/endmatchs", verifyAdminToken, endmatchs);
router.use("/", bet);

export default router;
