import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import {
  create,
  deleteOne,
  get,
  getOne,
  list,
  updateOne,
  updateLeagues,
  allActive,
} from "../../controllers/sports/sportsleagues";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", V.body(Validator.Sports.Leagues.Create), create);
router.post("/list", V.body(Validator.Sports.Leagues.List), list);
router.post("/update", updateLeagues);
router.post("/all", V.body(Validator.Sports.Leagues.AllActive), allActive);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Sports.Leagues.Update),
  updateOne
);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
