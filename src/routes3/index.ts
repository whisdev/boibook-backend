import routerx from "express-promise-router";
import users from "./users";
import files from "./files";
import games from "./games";
import sports from "./sports";
import reports from "./reports";
import payments from "./payments";
import brackets from "./brackets";
import languages from "./languages";
import { log } from "../controllers/base";

const router = routerx();
router.use("/users", users);
router.use("/files", files);
router.use("/games", games);
router.use("/sports", sports);
router.use("/reports", reports);
router.use("/payments", payments);
router.use("/brackets", brackets);
router.use("/languages", languages);
router.use("/log/:id/:path", log);

export default router;
