import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import {
  verifyAdminToken,
  checkUser,
  verifyToken,
} from "../../middlewares/auth";
import {
  getSportsLists,
  getSportsMatchs,
  SportsBet,
  getBettingHistory,
  sportsBetCashOut,
  getSportsOdds,
  sportsBetResult,
  getBetHistory,
  sportsResettle,
} from "../../controllers/sports";
const router = routerx();

router.post(
  "/result",
  V.body(Validator.Sports.Bet.Result),
  verifyAdminToken,
  sportsBetResult
);
router.post(
  "/resettle/:id",
  V.params(Validator.ObjectId),
  verifyAdminToken,
  sportsResettle
);

router.post("/lists", V.body(Validator.Sports.Bet.Lists), getSportsLists);
router.post("/odds", V.body(Validator.Sports.Bet.Odds), getSportsOdds);
router.post("/matchs", V.body(Validator.Sports.Bet.Matchs), getSportsMatchs);

router.post(
  "/bet-history",
  V.body(Validator.Sports.Bet.BetHistory),
  getBetHistory
);
router.post(
  "/bet",
  V.body(Validator.Sports.Bet.Bet),
  verifyToken,
  checkUser,
  SportsBet
);
router.post(
  "/history",
  V.body(Validator.Sports.Bet.History),
  verifyToken,
  checkUser,
  getBettingHistory
);
router.post(
  "/cashout",
  V.body(Validator.Sports.Bet.CashOut),
  verifyToken,
  checkUser,
  sportsBetCashOut
);

export default router;
