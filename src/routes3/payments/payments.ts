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
  approveWithdrawal,
} from "../../controllers/payment/payments";
import { verifyAdminToken } from "../../middlewares/auth";
const router = routerx();

router.get("/", get);
router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/", V.body(Validator.Payments.Payments.Create), create);
router.post("/list", V.body(Validator.Payments.Payments.List), list);
router.post("/csv", V.body(Validator.Payments.Payments.List), csv);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Payments.Payments.Update),
  updateOne
);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);
router.post(
  "/approve",
  V.body(Validator.Payments.Payments.ApproveWithdrawal),
  verifyAdminToken,
  approveWithdrawal
);

export default router;
