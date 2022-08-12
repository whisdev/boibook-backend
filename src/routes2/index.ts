import routerx from "express-promise-router";
import users from "./users";
import files from "./files";
import sports from "./sports";
import payments from "./payments";
import brackets from "./brackets";
import games from "./games";

const router = routerx();
router.use("/users", users);
router.use("/files", files);
router.use("/sports", sports);
router.use("/games", games);
router.use("/payments", payments);
router.use("/brackets", brackets);

export default router;
