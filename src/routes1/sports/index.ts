import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import {
  getSportsOdds,
  getSportsLists,
  getSportsMatchs,
} from "../../controllers/sports";
const router = routerx();

router.post("/lists", V.body(Validator.Sports.Bet.Lists), getSportsLists);
router.post("/odds", V.body(Validator.Sports.Bet.Odds), getSportsOdds);
router.post("/matchs", V.body(Validator.Sports.Bet.Matchs), getSportsMatchs);

export default router;
