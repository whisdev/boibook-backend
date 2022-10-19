import * as geoip from "geoip-country";
import * as requestIp from "request-ip";
import * as moment from "moment";
import { Response, NextFunction } from "express";
import { Sessions } from "../models";
import { getSessionTime } from "../controllers/base";
const log = require("log-to-file");
const config = require("../../config");

const adminiplist = [
  "74.208.139.129",
];

var whitelist: any = [];

if (process.env.MODE === "dev") {
  whitelist = ["http://localhost:3000", "http://localhost:2022"];
} else {
  whitelist = ["https://boibook.io", "https://admin.boibook.io", "https://www.boibook.io", "https://www.admin.boibook.io"];
}

const apilist = [
  "/api/v1/sports/matchs",
  "/api/v1/sports/lists",
  "/api/v1/sports/odds",
  "/api/v1/reports/profit",
  "/api/v1/reports/bracket",
  "/api/v1/languages/word",
  "/api/v1/languages/language",
];

const adminPathList = ["/signin", "/signup", "/signout", "/changePassword"];

const iplist = ["74.208.139.129"];

const useragentlist = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0",
  "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0",
];

export const verifyToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.headers.authorization;
    if (!accessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      const user: any = await Sessions.findOneAndUpdate(
        { accessToken },
        { expiration: getSessionTime() }
      ).populate("userId");
      if (user && user.userId && user.userId.status) {
        req.user = user.userId;
        next();
      } else {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export const verifyAdminToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.token;
    if (!token || token != process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    } else if (adminPathList.includes(req.path)) {
      next();
    } else {
      const accessToken = req.headers.authorization;
      if (!accessToken) {
        return res.status(401).json({ error: "Unauthorized" });
      } else {
        const user: any = await Sessions.findOneAndUpdate(
          { accessToken },
          { expiration: getSessionTime() }
        ).populate("userId");
        if (
          user &&
          user.userId &&
          user.userId.status &&
          user.userId.permissionId.title === "admin"
        ) {
          req.user = user.userId;
          next();
        } else {
          return res.status(401).json({ error: "Unauthorized" });
        }
      }
    }
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export const checkUser = (req: any, res: Response, next: NextFunction) => {
  if (req.body.userId !== String(req.user._id)) {
    console.log(`req.method`, req.method);
    console.log(`req.url`, req.url);
    console.log(`req.user`, req.user);
    console.log(`req.body`, req.body);
    return res.status(401).json({ error: "Unauthorized" });
  } else {
    next();
  }
};

export const checkUrl = (req: any, res: Response, next: NextFunction) => {
  const ip = requestIp.getClientIp(req);
  if (ip) {
    const ipaddress = ip.replace("::ffff:", "");
    const geo = geoip.lookup(ipaddress);
    if (
      iplist.indexOf(ipaddress) !== -1 ||
      useragentlist.indexOf(req.headers["user-agent"]) == undefined ||
      useragentlist.indexOf(req.headers["user-agent"]) !== -1 ||
      (req.headers["user-agent"] &&
        req.headers["user-agent"].indexOf("Firefox/91.0") !== -1)
    ) {
      console.log(
        "403 ******",
        ip.replace("::ffff:", ""),
        "******",
        geo?.country,
        "******",
        req.method,
        "******",
        req.url,
        "******",
        req.header("Origin"),
        "******"
      );
      console.log(req.headers);
      console.log(req.body);
      return res.status(403).json(`You can't access.`);
    } else {
      if (
        apilist.indexOf(req.url) === -1 &&
        adminiplist.indexOf(ipaddress) === -1
      ) {
        const filepath = `${config.DIR}/rlog/log-${moment().format(
          "YYYY-MM-DD"
        )}.log`;
        log(
          `start\n${geo?.country} ${ipaddress}  ${req.method}  ${req.url
          }\nheaders ${JSON.stringify(req.headers)}\nparams ${JSON.stringify(
            req.params
          )}\nbody ${JSON.stringify(req.body)}\nend\r\n\n`,
          filepath
        );
        console.log(
          `===`,
          geo?.country,
          `===`,
          req.header("Origin"),
          `===`,
          ipaddress,
          `===`,
          req.method,
          `===`,
          req.url,
          `====`,
          req.headers["user-agent"],
          `===\n`
        );
      }
      next();
    }
  } else {
    return res.status(403).json(`You can't access.`);
  }
};

export const corsOptionsDelegate = (req: any, callback: Function) => {
  let corsOptions;
  try {
    const ip = requestIp.getClientIp(req) as string;
    const ipaddress = ip.replace("::ffff:", "");
    if (iplist.indexOf(ipaddress) !== -1) {
      corsOptions = true;
    } else if (req.method === "GET") {
      corsOptions = false;
    } else if (req.headers["user-agent"] === "CoinPayments.net IPN Generator") {
      corsOptions = false;
    } else if (
      req.header("Origin") !== undefined &&
      whitelist.indexOf(req.header("Origin")) !== -1
    ) {
      corsOptions = false;
    } else {
      const ip = requestIp.getClientIp(req) as string;
      const geo = geoip.lookup(ip);
      console.log(
        "******",
        ip.replace("::ffff:", ""),
        "******",
        geo?.country,
        "******",
        req.method,
        "******",
        req.url,
        "******",
        req.header("Origin"),
        "******"
      );
      console.log(req.headers);
      console.log(req.body);
      corsOptions = true;
    }
  } catch (error) {
    console.log(error);
    corsOptions = true;
  }
  callback(corsOptions);
};
