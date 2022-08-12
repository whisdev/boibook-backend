import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import {
  create,
  deleteOne,
  get,
  getOne,
  list,
  updateOne,
  getEvents,
} from "../../controllers/sports/sportsbettings";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", V.body(Validator.Sports.Betting.Create), create);
router.post("/list", V.body(Validator.Sports.Betting.List), list);
router.post("/events", V.body(Validator.Sports.Betting.Event), getEvents);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Sports.Betting.Update),
  updateOne
);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
