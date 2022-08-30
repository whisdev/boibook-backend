import routerx from "express-promise-router";
import {
  getOne,
  list,
  create,
  updateOne,
  deleteOne,
} from "../../controllers/advertisements";
import { V, Validator } from "../../middlewares/validation";
const router = routerx();

router.get("/:id", V.params(Validator.ObjectId), getOne);
router.post("/list", list);
router.post("/create", V.body(Validator.Advertisements.Create), create);
router.put(
  "/:id",
  V.params(Validator.ObjectId),
  V.body(Validator.Advertisements.Update),
  updateOne
);
router.delete("/:id", V.params(Validator.ObjectId), deleteOne);

export default router;
