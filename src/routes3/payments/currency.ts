import routerx from "express-promise-router";
import { V, Validator } from "../../middlewares/validation";
import {
  create,
  deleteOne,
  get,
  getOne,
  list,
  updateOne,
  label,
} from "../../controllers/payment/currency";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", V.body(Validator.Payments.Currency.Create), create);
router.post("/list", V.body(Validator.Payments.Currency.List), list);
router.post("/label", label);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Payments.Currency.Update),
  updateOne
);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
