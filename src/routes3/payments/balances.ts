import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import {
  create,
  deleteOne,
  get,
  getOne,
  list,
  updateOne,
  csv,
} from "../../controllers/payment/balances";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", V.body(Validator.Payments.Balances.Create), create);
router.post("/list", V.body(Validator.Payments.Balances.List), list);
router.post("/csv", V.body(Validator.Payments.Balances.List), csv);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Payments.Balances.Update),
  updateOne
);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
