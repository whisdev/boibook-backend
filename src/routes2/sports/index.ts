import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import { checkUser, verifyToken } from "../../middlewares/auth";
import {
  SportsBet,
  getBettingHistory,
  sportsBetCashOut,
  getBetHistory,
} from "../../controllers/sports";
import rateLimit from "express-rate-limit";
const router = routerx();

const Mlimiter = rateLimit({
  windowMs: 500,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/bet-history",
  V.body(Validator.Sports.Bet.BetHistory),
  getBetHistory
);
router.post(
  "/bet",
  Mlimiter,
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
