import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import { checkUser, verifyToken } from "../../middlewares/auth";
import {
  betBracket,
  getBracketBet,
  getBracketHistory,
  getBracketLeaderBoard,
  getBracketMatchs,
} from "../../controllers/brackets";
const router = routerx();

router.post("/match", getBracketMatchs);
router.get("/bracket-bet/:id", V.params(Validator.ObjectId), getBracketBet);
router.get(
  "/leaderboard/:id",
  V.params(Validator.ObjectId),
  getBracketLeaderBoard
);
router.post(
  "/bet",
  V.body(Validator.Brackets.Bet.Bet),
  verifyToken,
  checkUser,
  betBracket
);
router.post(
  "/history",
  V.body(Validator.UserId),
  verifyToken,
  checkUser,
  getBracketHistory
);

export default router;
