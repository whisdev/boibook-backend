import { ObjectId } from "../base";
import { bettingSettled } from "./sportsresult";
import { SportsBetting, SportsFixMatchs } from "../../models";
import { Request, Response } from "express";

const aggregateQuery = [
  {
    $lookup: {
      from: "sports_bettings",
      localField: "id",
      foreignField: "eventId",
      as: "bettings",
    },
  },
  {
    $match: { "bettings.status": "BET" },
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
    $sort: {
      "sport.order": 1,
      time_status: -1,
      time: 1,
    },
  },
  {
    $project: {
      id: 1,
      sport_id: 1,
      sport: 1,
      time: 1,
      time_status: 1,
      league: 1,
      home: 1,
      away: 1,
      ss: 1,
      points: 1,
      playing_indicator: 1,
      scores: 1,
      stats: 1,
      extra: 1,
      events: 1,
      timer: 1,
      has_lineup: 1,
      inplay_created_at: 1,
      inplay_updated_at: 1,
      confirmed_at: 1,
      odds: 1,
      status: 1,
      count: {
        $size: "$bettings",
      },
    },
  },
] as any;

const aggregateQuery1 = [
  {
    $lookup: {
      from: "sports_bettings",
      localField: "id",
      foreignField: "eventId",
      as: "bettings",
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
    $sort: {
      "sport.order": 1,
      time_status: -1,
      time: 1,
    },
  },
  {
    $project: {
      id: 1,
      sport_id: 1,
      sport: 1,
      time: 1,
      time_status: 1,
      league: 1,
      home: 1,
      away: 1,
      ss: 1,
      points: 1,
      playing_indicator: 1,
      scores: 1,
      stats: 1,
      extra: 1,
      events: 1,
      timer: 1,
      has_lineup: 1,
      inplay_created_at: 1,
      inplay_updated_at: 1,
      confirmed_at: 1,
      odds: 1,
      status: 1,
      count: {
        $size: "$bettings",
      },
    },
  },
] as any;

export const get = async (req: Request, res: Response) => {
  const result = await SportsFixMatchs.aggregate(aggregateQuery);
  return res.json(result);
};

export const getOne = async (req: Request, res: Response) => {
  const result = await SportsFixMatchs.aggregate([
    { $match: { _id: ObjectId(req.params.id) } },
    ...aggregateQuery1,
  ]);
  return res.json(result[0]);
};

export const list = async (req: Request, res: Response) => {
  const {
    eventId = null,
    SportId = null,
    date = null,
    hide = null,
    timeStatus,
    pageSize = null,
    page = null,
  } = req.body;
  let query = {} as any;
  let match = {} as any;
  if (hide) {
    match = { count: { $ne: 0 } };
  }
  if (eventId) {
    query.id = Number(eventId);
  }
  if (SportId) {
    query.sport_id = SportId;
  }
  if (timeStatus !== "" && timeStatus !== undefined) {
    query.time_status = timeStatus;
  }
  if (date && date[0] && date[1]) {
    query.time = {
      $gte: new Date(date[0]).valueOf() / 1000,
      $lte: new Date(date[1]).valueOf() / 1000,
    };
  }
  if (hide) {
    const sportsFixMatchs = await SportsFixMatchs.aggregate([
      { $match: query },
      ...aggregateQuery,
      { $match: match },
    ]);
    const count = sportsFixMatchs.length;
    if (!pageSize || !page) {
      return res.json({ results: sportsFixMatchs, count });
    } else {
      const results = await SportsFixMatchs.aggregate([
        { $match: query },
        ...aggregateQuery,
        { $match: match },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ]);
      return res.json({ results, count });
    }
  } else {
    const sportsFixMatchs = await SportsFixMatchs.aggregate([
      { $match: query },
      ...aggregateQuery1,
      { $match: match },
    ]);
    const count = sportsFixMatchs.length;
    if (!pageSize || !page) {
      return res.json({ results: sportsFixMatchs, count });
    } else {
      const results = await SportsFixMatchs.aggregate([
        { $match: query },
        ...aggregateQuery1,
        { $match: match },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ]);
      return res.json({ results, count });
    }
  }
};

export const create = async (req: Request, res: Response) => {
  const result = await SportsFixMatchs.create(req.body);
  return res.json(result);
};

export const updateOne = async (req: Request, res: Response) => {
  const query = { _id: ObjectId(req.params.id) };
  await SportsFixMatchs.updateOne(query, req.body);
  const result = await SportsFixMatchs.aggregate([
    { $match: query },
    ...aggregateQuery,
  ]);
  return res.json(result[0]);
};

export const deleteAll = async (req: Request, res: Response) => {
  const result = await SportsFixMatchs.deleteMany();
  return res.json(result);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await SportsFixMatchs.deleteOne({
    _id: ObjectId(req.params.id),
  });
  return res.json(result);
};

export const betSettled = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id);
  const sportsBets = await SportsBetting.aggregate([
    {
      $match: { status: "BET", eventId },
    },
    {
      $lookup: {
        from: "sports_fix_matchs",
        localField: "eventId",
        foreignField: "id",
        as: "matchs",
      },
    },
    {
      $unwind: "$matchs",
    },
    {
      $match: {
        "matchs.status": true,
      },
    },
  ]);
  if (sportsBets.length) {
    for (const i in sportsBets) {
      const bet = sportsBets[i];
      if (bet.matchs.time_status === 3) {
        const reuslt = await bettingSettled({ bet, data: bet.matchs });
        if (reuslt.state) {
          await SportsBetting.updateOne({ _id: ObjectId(bet._id) }, reuslt);
        }
      } else if (bet.matchs.time_status === 101) {
        await SportsBetting.updateOne(
          { _id: ObjectId(bet._id) },
          { status: "REFUND", profit: bet.stake }
        );
      }
    }
    await SportsFixMatchs.updateOne({ id: eventId }, { time_status: 10 });
    return res.json({ status: true });
  } else {
    return res.status(400).json(`Not found betId.`);
  }
};
