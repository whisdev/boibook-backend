import * as md5 from "md5";
import * as moment from "moment";
import * as request from "request";
import { Request, Response } from "express";
import { filterOdds } from "./sportsrealtime";
import { aggregateQuery } from "./sportsbets";
import { bettingSettled } from "./sportsresult";
import {
  checkBalance,
  generatInfo,
  getActiveBet,
  handleBet,
  ObjectId,
} from "../base";
import {
  Currencies,
  SportsBets,
  SportsBetting,
  SportsLeagues,
  SportsLists,
  SportsMatchs,
  Users,
} from "../../models";

// const updateDTManually = async () => {
//   console.log("start");
//   await Users.updateMany({}, { pReferral: 0.02 });
//   // await SportsLeagues.updateMany({ SportId: 2 }, { status: true });
//   // await SportsLeagues.updateMany({ SportId: 9 }, { status: true });
//   // await SportsLeagues.updateMany({ SportId: 151 }, { status: true });
//   console.log("done");
// };

// updateDTManually();

export const getSportsLists = async (req: Request, res: Response) => {
  const { EventStatus } = req.body;
  let query1 = {} as any;
  let query2 = {} as any;
  const gte = Math.floor(Date.now().valueOf() / 1000);
  if (EventStatus) {
    query1.time_status = 0;
  }
  if (EventStatus === "LIVE") {
    query1.time_status = 1;
    query2.live = true;
  }
  if (EventStatus === "HOUR") {
    const lte = Math.floor(moment().add(1, "hours").valueOf() / 1000);
    query1.time = { $gte: gte, $lte: lte };
    query2.upcoming = true;
  }
  if (EventStatus === "TODAY") {
    const lte = Math.floor(moment().add(1, "days").valueOf() / 1000);
    query1.time = { $gte: gte, $lte: lte };
    query2.upcoming = true;
  }
  if (EventStatus === "PRE") {
    const lte = Math.floor(moment().add(7, "days").valueOf() / 1000);
    query1.time = { $gte: gte, $lte: lte };
    query2.upcoming = true;
  }
  query1.odds = { $ne: {} };
  query1.astatus = true;
  query1.odds = { $ne: {} };
  const data = await SportsMatchs.aggregate([
    {
      $match: query1,
    },
    {
      $lookup: {
        from: "sports_lists",
        localField: "sport_id",
        foreignField: "SportId",
        as: "sport",
      },
    },
    {
      $unwind: "$sport",
    },
    {
      $group: {
        _id: {
          icon: "$sport.icon",
          SportId: "$sport.SportId",
          SportName: "$sport.SportName",
          color: "$sport.color",
          status: "$sport.status",
          live: "$sport.live",
          upcoming: "$sport.upcoming",
          id: "$sport._id",
          order: "$sport.order",
          img: "$sport.img",
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.order": 1,
      },
    },
    {
      $match: { "_id.status": true },
    },
    {
      $project: {
        _id: "$_id.id",
        icon: "$_id.icon",
        color: "$_id.color",
        SportId: "$_id.SportId",
        SportName: "$_id.SportName",
        live: "$_id.live",
        upcoming: "$_id.upcoming",
        img: "$_id.img",
        count: "$count",
      },
    },
    {
      $match: query2,
    },
  ]);
  return res.json(data);
};

export const getSportsOdds = async (req: Request, res: Response) => {
  const { id } = req.body;
  const event = await SportsMatchs.findOne({
    $and: [{ time_status: { $ne: 3 } }, { time_status: { $ne: 2 } }, { id }],
  }).select({ extra: 0, stats: 0, events: 0 });
  if (event) {
    const activeSports = await SportsLists.findOne({ SportId: event.sport_id });
    return res.json({ state: true, event, activeSports });
  } else {
    return res.json({ state: false });
  }
};

export const getSportsMatchs = async (req: Request, res: Response) => {
  const { EventStatus, SportId } = req.body;
  const gte = Math.floor(Date.now().valueOf() / 1000);
  if (EventStatus === "LIVE") {
    const query = {
      sport_id: Number(SportId),
      time_status: Number(1),
    };
    const squery = {
      "sport.status": true,
      "sport.live": true,
    };
    return await getSportMatchs(req, res, query, squery);
  } else if (EventStatus === "HOUR") {
    const lte = Math.floor(moment().add(1, "hours").valueOf() / 1000);
    const query = {
      sport_id: Number(SportId),
      time_status: Number(0),
      time: { $gte: gte, $lte: lte },
    };
    const squery = {
      "sport.status": true,
      "sport.upcoming": true,
    };
    return await getSportMatchs(req, res, query, squery);
  } else if (EventStatus === "TODAY") {
    const lte = Math.floor(moment().add(1, "days").valueOf() / 1000);
    const query = {
      sport_id: Number(SportId),
      time_status: Number(0),
      time: { $gte: gte, $lte: lte },
    };
    const squery = {
      "sport.status": true,
      "sport.upcoming": true,
    };
    return await getSportMatchs(req, res, query, squery);
  } else if (EventStatus === "PRE") {
    const lte = Math.floor(moment().add(7, "days").valueOf() / 1000);
    const query = {
      sport_id: Number(SportId),
      time_status: Number(0),
      time: { $gte: gte, $lte: lte },
    };
    const squery = {
      "sport.status": true,
      "sport.upcoming": true,
    };
    return await getSportMatchs(req, res, query, squery);
  } else {
    return res.json([]);
  }
};

export const getSportMatchs = async (
  req: Request,
  res: Response,
  query: any,
  squery: any
) => {
  query.astatus = true;
  query.odds = { $ne: {} };
  const results = await SportsMatchs.aggregate([
    {
      $match: query,
    },
    {
      $sort: {
        time: 1,
      },
    },
    {
      $lookup: {
        from: "sports_lists",
        localField: "sport_id",
        foreignField: "SportId",
        as: "sport",
      },
    },
    {
      $unwind: "$sport",
    },
    {
      $match: squery,
    },
    {
      $group: {
        _id: {
          LeagueId: "$league.id",
          LeagueName: "$league.name",
        },
        events: {
          $push: {
            _id: "$_id",
            id: "$id",
            sport_id: "$sport_id",
            league: "$league",
            home: "$home",
            away: "$away",
            odds: "$odds",
            teams: "$teams",
            ss: "$ss",
            scores: "$scores",
            points: "$points",
            time: "$time",
            timer: "$timer",
            time_status: "$time_status",
          },
        },
      },
    },
    {
      $lookup: {
        from: "sports_leagues",
        localField: "_id.LeagueId",
        foreignField: "id",
        as: "league",
      },
    },
    {
      $unwind: "$league",
    },
    {
      $match: {
        "league.status": true,
      },
    },
    {
      $sort: {
        "league.order": 1,
        "events.time": 1,
        "_id.LeagueName": 1,
      },
    },
    {
      $project: {
        _id: 0,
        LeagueId: "$_id.LeagueId",
        LeagueName: "$_id.LeagueName",
        events: "$events",
      },
    },
  ]);
  return res.json(results);
};

const saveBet = async (data: any) => {
  const sportsBets = new SportsBets(data);
  let bets = data.bets;
  for (const i in bets) {
    bets[i].betId = sportsBets._id;
  }
  await sportsBets.save();
  await SportsBetting.insertMany(bets);
};

const getOdds = (event_id: number, odds: any) => {
  return new Promise(async (resolve, reject) => {
    const options = {
      method: "GET",
      url: process.env.ODDS_ENDPOINT as string,
      headers: { "Content-Type": "application/json" },
      qs: { token: process.env.SPORTSBOOK_APIKEY, event_id },
      json: true,
    };
    request(options, async (error: any, response: any, body: any) => {
      if (error) {
        resolve(true);
      } else {
        if (body && body.success && body.results && body.results.odds) {
          const newOdds: any = await filterOdds(body.results.odds);
          if (odds?.id !== newOdds[odds.marketId]?.id) {
            resolve(true)
          } else {
            resolve(false)
          }
        }
      }
    });
  });
};

const getEndedEvents = async (event_id: number, odds: any, bet: any) => {
  return new Promise(async (resolve, reject) => {
    const options = {
      method: "GET",
      url: process.env.ENDED_ENDPOINT as string,
      headers: { "Content-Type": "application/json" },
      qs: { token: process.env.SPORTSBOOK_APIKEY, event_id },
      json: true,
    };
    request(options, async (error: any, response: any, body: any) => {
      if (error) {
        return resolve(2);
      }
      if (body && body.success && body.results[0]) {
        const result = body.results[0];
        if (result.time_status == 0) {
          if (result.time * 1000 > Date.now()) {
            return resolve(0);
          } else {
            return resolve(3);
          }
        } else if (result.time_status == 1) {
          const update = await getOdds(event_id, odds);
          if (update) {
            return resolve(4);
          } else if (bet.oddType === "over") {
            const settled = await bettingSettled({ data: result, bet });
            console.log("============settled============");
            console.log(settled);
            console.log("============settled============");
            if (settled.status !== "LOST") {
              return resolve(4);
            }
          }
          return resolve(1);
        } else {
          return resolve(2);
        }
      } else {
        return resolve(2);
      }
    });
  });
};

export const SportsBet = async (req: Request, res: Response) => {
  const { type, userId, currency, stake } = req.body;
  const betCurrency: any = await Currencies.findById(ObjectId(currency));
  const betsId = md5(Date.now().toString());
  if (type === "multi") {
    const betsData = [] as any;
    let bets = req.body.data.bets;
    if (req.body.data.potential > betCurrency?.betLimit) {
      return res
        .status(400)
        .json(
          `Your bet exceeds the maximum. Maximum ${betCurrency?.symbol} Bet Limit is ${betCurrency?.betLimit} ${betCurrency?.symbol}.`
        );
    }
    for (const i in bets) {
      const finished = await getEndedEvents(
        bets[i].eventId,
        bets[i].oddData,
        bets[i]
      );
      if (finished === 4) {
        bets[i].updated = true;
        console.log(`userId`, userId, bets[i].eventId);
      } else if (finished === 2 || finished === 3) {
        bets[i].finished = true;
      } else if (finished === 1) {
        const sportsList = await SportsLists.findOne({
          SportId: bets[i].SportId,
          status: true,
          live: true,
        });
        if (!sportsList) {
          bets[i].finished = true;
          console.log(`finished-live`, userId);
        } else {
          const { eventId, marketId, oddId } = bets[i];
          const item = await SportsMatchs.findOne({
            id: eventId,
            [`odds.${marketId}.id`]: oddId,
          });
          if (!item) {
            bets[i].updated = true;
          } else {
            if (item.odds[marketId].notUpdate > 11) {
              bets[i].updated = true;
            }
          }
        }
      } else if (finished === 0) {
        const sportsList = await SportsLists.findOne({
          SportId: bets[i].SportId,
          status: true,
          upcoming: true,
        });
        if (!sportsList) {
          bets[i].finished = true;
          console.log(`finished-upcoming`, userId);
        }
      }
      if (finished === 3) {
        console.log(`bet`, userId);
      }
      betsData.push(bets[i]);
    }
    const data = betsData.filter(
      (e: any) => e.finished !== true && e.updated !== true
    );
    const ufData = betsData.filter(
      (e: any) => e.finished === true || e.updated === true
    );
    req.body.data.bets = data;
    if (ufData.length > 0) {
      return res.status(400).json("Bet rejected. Odds changed.");
    } else {
      const isBet = await getActiveBet({ userId, currency, amount: stake });
      const checked = await checkBalance({ userId, currency, amount: stake });
      if (!checked) {
        return res.status(400).json("Balances not enough!");
      } else if (!isBet) {
        return res
          .status(400)
          .json(
            "Max bet limit has been reached. Please wait until your active bets are settled."
          );
      } else {
        await handleBet({
          req,
          currency,
          userId,
          amount: stake * -1,
          type: "sports-multi-bet",
          status: false,
          info: generatInfo(),
        });
        req.body.data.potential = data.reduce(
          (sum: number, { odds }: { odds: number }) => (sum *= Number(odds)),
          Number(stake)
        );
        req.body.data.odds = data.reduce(
          (sum: number, { odds }: { odds: number }) => (sum *= Number(odds)),
          1
        );
        req.body.data.betsId = betsId;
        await saveBet(req.body.data);
        req.body.data.bets = data;
        req.app.get("io").emit("bet");
        return res.json({ data: req.body, betsId });
      }
    }
  } else {
    const betsData = [] as any;
    for (const i in req.body.data) {
      let data = req.body.data[i];
      if (data.potential > betCurrency?.betLimit) {
        return res
          .status(400)
          .json(
            `Your bet exceeds the maximum. Maximum ${betCurrency?.symbol} Bet Limit is ${betCurrency?.betLimit} ${betCurrency?.symbol}.`
          );
      }
      const finished = await getEndedEvents(
        data.bets[0].eventId,
        data.bets[0].oddData,
        data.bets[0]
      );
      if (finished === 4) {
        data.bets[0].updated = true;
        console.log(`userId`, userId, data.bets[0].eventId);
      } else if (finished === 2 || finished === 3) {
        data.bets[0].finished = true;
      } else if (finished === 1) {
        const sportsList = await SportsLists.findOne({
          SportId: data.bets[0].SportId,
          status: true,
          live: true,
        });
        if (!sportsList) {
          data.bets[0].finished = true;
          console.log(`finished-live`, userId);
        } else {
          const { eventId, marketId, oddId, SportId } = data.bets[0];
          const item = await SportsMatchs.findOne({
            id: eventId,
            [`odds.${marketId}.id`]: oddId,
          });
          if (!item) {
            data.bets[0].updated = true;
          } else {
            if (item.odds[marketId].notUpdate > 11) {
              data.bets[0].updated = true;
            }
          }
        }
      } else if (finished === 0) {
        const sportsList = await SportsLists.findOne({
          SportId: data.bets[0].SportId,
          status: true,
          upcoming: true,
        });
        if (!sportsList) {
          data.bets[0].finished = true;
          console.log(`finished-upcoming`, userId);
        }
      }
      if (finished === 3) {
        console.log(`bet`, userId);
      }
      data.betsId = betsId;
      betsData.push(data);
    }
    req.body.data = betsData;
    const data = betsData.filter(
      (e: any) => e.bets[0].finished !== true && e.bets[0].updated !== true
    );
    if (data.length === 0) {
      req.app.get("io").emit("bet");
      return res.json({ data: req.body });
    } else {
      const tstake = data.reduce((sum: number, { stake }: { stake: number }) => (sum += Number(stake)), 0);
      // const isBet = await getActiveBet({ userId, currency, amount: tstake });
      const checked = await checkBalance({ userId, currency, amount: tstake });
      if (!checked) {
        return res.status(400).json("Balances not enough!");
        // } else if (!isBet) {
        //   return res
        //     .status(400)
        //     .json(
        //       "Max bet limit has been reached. Please wait until your active bets are settled."
        //     );
      } else {
        await handleBet({
          req,
          currency,
          userId,
          amount: tstake * -1,
          type: "sports-single-bet",
          info: generatInfo(),
        });
        for (const i in data) {
          await saveBet(data[i]);
        }
        req.app.get("io").emit("bet");
        return res.json({ data: req.body, betsId });
      }
    }
  }
};

export const getBetHistory = async (req: Request, res: Response) => {
  const { betsId } = req.body;
  const data = await SportsBets.aggregate([
    {
      $match: { betsId },
    },
    {
      $lookup: {
        from: "sports_lists",
        localField: "betType",
        foreignField: "SportId",
        as: "sport",
      },
    },
    {
      $lookup: {
        from: "sports_bettings",
        localField: "_id",
        foreignField: "betId",
        as: "bettings",
      },
    },
    {
      $lookup: {
        from: "currencies",
        localField: "currency",
        foreignField: "_id",
        as: "currency",
      },
    },
    {
      $unwind: "$currency",
    },
    {
      $project: {
        "currency.abi": 0,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);
  if (!data.length) return res.status(400).json("The URL is invalid.");
  const type = data[0].type;
  let count = 0;
  const user: any = await Users.findById(ObjectId(data[0].userId)).select({
    username: 1,
    _id: 0,
    permissionId: 0,
  });
  if (type == "multi") {
    count = data[0].bettings.length;
  } else {
    count = data.length;
  }
  const total = data.reduce(
    (t, { bettings }) =>
    (t += bettings.reduce(
      (s: number, { odds }: { odds: number }) => (s *= Number(odds)),
      1
    )),
    0
  );
  return res.json({
    data,
    username: `${user.username.slice(0, 2)}*****`,
    type,
    count,
    total,
  });
};

export const getBettingHistory = async (req: Request, res: Response) => {
  const { userId, status } = req.body;
  let qurey = {
    userId: ObjectId(userId),
  } as any;
  if (status === "Active") {
    qurey.status = "BET";
  } else if (status === "Settled") {
    qurey.status = { $ne: "BET" };
  }
  const sportsBets = await SportsBets.aggregate([
    {
      $match: qurey,
    },
    {
      $lookup: {
        from: "sports_lists",
        localField: "betType",
        foreignField: "SportId",
        as: "sport",
      },
    },
    {
      $lookup: {
        from: "sports_bettings",
        localField: "_id",
        foreignField: "betId",
        as: "bettings",
      },
    },
    {
      $lookup: {
        from: "currencies",
        localField: "currency",
        foreignField: "_id",
        as: "currency",
      },
    },
    {
      $unwind: "$currency",
    },
    {
      $project: {
        "currency.abi": 0,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);
  return res.json(sportsBets);
};

export const getRecentBettingHistory = async (req: Request, res: Response) => {
  let qurey = {} as any;
  qurey.status = "BET";
  const sportsBets = await SportsBets.aggregate([
    {
      $match: qurey,
    },
    {
      $lookup: {
        from: "sports_lists",
        localField: "betType",
        foreignField: "SportId",
        as: "sport",
      },
    },
    {
      $lookup: {
        from: "sports_bettings",
        localField: "_id",
        foreignField: "betId",
        as: "bettings",
      },
    },
    {
      $lookup: {
        from: "currencies",
        localField: "currency",
        foreignField: "_id",
        as: "currency",
      },
    },
    {
      $unwind: "$currency",
    },
    {
      $project: {
        "currency.abi": 0,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]).limit(30);
  return res.json(sportsBets);
};

export const sportsBetCashOut = async (req: Request, res: Response) => {
  const { betId } = req.body;
  const sportsBets: any = await SportsBets.findOneAndUpdate(
    {
      _id: ObjectId(betId),
      status: { $ne: "SETTLED" },
    },
    { status: "SETTLED" },
    { new: true }
  );
  if (sportsBets) {
    const result = await handleBet({
      req,
      userId: sportsBets.userId?._id,
      currency: sportsBets.currency?._id,
      amount: Number(sportsBets.stake) * 0.95,
      type: "sports-bet-cashout",
      status: false,
      info: sportsBets._id,
    });
    return res.json(result);
  } else {
    return res.status(400).json(`Not found betId.`);
  }
};

export const sportsBetResult = async (req: Request, res: Response) => {
  const { _id, status } = req.body;
  const bet: any = await SportsBetting.findById(ObjectId(_id));
  let profit = 0;
  if (bet) {
    if (status === "WIN") {
      profit = bet.stake * bet.odds;
    } else if (status === "LOST") {
      profit = bet.stake * -1;
    } else if (status === "REFUND" || status === "CANCEL") {
      profit = bet.stake;
    } else if (status === "HALF_WIN") {
      profit = (bet.stake * bet.odds) / 2 + bet.stake / 2;
    } else if (status === "HALF_LOST") {
      profit = (bet.stake / 2) * -1;
    }
    const data = await SportsBetting.findByIdAndUpdate(
      ObjectId(bet._id),
      { status, profit },
      { new: true }
    );
    return res.json({ status: true, data });
  } else {
    return res.status(400).json(`Not found betId.`);
  }
};

export const sportsResettle = async (req: Request, res: Response) => {
  const _id = ObjectId(req.params.id);
  const bet: any = await SportsBets.findOneAndUpdate(
    { _id, status: { $ne: "BET" } },
    { status: "BET", profit: 0 }
  );
  if (!bet) return res.status(400).json(`Not found betId.`);
  if (bet.status !== "LOST" && bet.status !== "HALF_LOST") {
    await handleBet({
      req,
      userId: bet.userId,
      currency: bet.currency,
      amount: bet.profit * -1,
      type: "sports-resettle",
      info: bet._id,
    });
  }
  await SportsBetting.updateMany({ betId: _id }, { status: "BET", profit: 0 });
  const result = await SportsBets.aggregate([
    { $match: { _id } },
    ...aggregateQuery,
  ]);
  return res.json(result[0]);
};
