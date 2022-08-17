import "dotenv/config";
import "regenerator-runtime";
import * as cors from "cors";
import * as path from "path";
import * as morgan from "morgan";
import * as express from "express";
import * as mongoose from "mongoose";
import * as bodyParser from "body-parser";
import * as compression from "compression";
import * as session from "express-session";
import * as useragent from "express-useragent";
import * as methodOverride from "method-override";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createStream } from "rotating-file-stream";
import socket from "./socket";
import routes1 from "./routes1";
import routes2 from "./routes2";
import routes3 from "./routes3";
import { RetrunValidation } from "./middlewares/validation";
import { checkUrl, corsOptionsDelegate } from "./middlewares/auth";
import { clientErrorHandler, logErrors } from "./controllers/base";
const config = require("../config");

const app = express();

const accessLogStream = createStream("access.log", {
  interval: "1d",
  path: path.join(`${config.DIR}`, "log"),
});
app.use(compression());
app.use(useragent.express());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: "application/json" }));
app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
app.use(bodyParser.text({ type: "text/html" }));
app.use(methodOverride());
app.use(logErrors);
app.use(clientErrorHandler);
app.use(express.static(`${config.DIR}/upload`));
app.use(express.static(`${config.DIR}/teams`));

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "no-referrer" },
  })
);
app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    saveUninitialized: true,
    resave: true,
    cookie: {
      httpOnly: true,
      secure: true,
      domain: "boibook.io",
      path: "*",
      expires: new Date(Date.now() + 60 * 60 * 1000),
    },
  })
);

app.use(express.static(`${config.DIR}/boibook`));

if (process.env.MODE === "dev") {
  app.use(cors("*" as cors.CorsOptions));
} else {
  app.use(cors(corsOptionsDelegate));
  app.use(checkUrl);
}

const apiV1Limiter = rateLimit({
  windowMs: 5 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const apiV2Limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

const apiV3Limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3000,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/v1/", apiV1Limiter, routes1);
app.use("/api/v2/", apiV2Limiter, routes2);
app.use("/api/v3/", apiV3Limiter, routes3);
app.get("*", apiV2Limiter, (req: express.Request, res: express.Response) =>
  res.sendFile(`${config.DIR}/boibook/index.html`)
);

app.use(RetrunValidation);

mongoose
  .connect(process.env.DATABASE as string)
  .then(() => {
    const http = require("http").createServer(app);
    const io = require("socket.io")(http, { cors: { origin: "*" } });
    socket(io);
    app.set("io", io);
    const port = process.env.PORT;
    http.listen(port);
    console.log("server listening on:", port);
  })
  .catch((error: any) => {
    console.log("database connection error => ", error);
  });
