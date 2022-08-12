import { ObjectId } from "../base";
import { SportsMatchs } from "../../models";
import * as moment from "moment-timezone";
import { Request, Response } from "express";

const aggregateQuery = [
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
] as any;

export const get = async (req: Request, res: Response) => {
  const result = await SportsMatchs.aggregate(aggregateQuery);
  return res.json(result);
};

export const getOne = async (req: Request, res: Response) => {
  const result = await SportsMatchs.aggregate([
    { $match: { _id: ObjectId(req.params.id) } },
    ...aggregateQuery,
  ]);
  return res.json(result[0]);
};

export const list = async (req: Request, res: Response) => {
  const {
    eventId = null,
    SportId = null,
    date = null,
    timeStatus,
    pageSize = null,
    page = null,
  } = req.body;
  let query = {} as any;
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
  const count = await SportsMatchs.countDocuments(query);
  if (!pageSize || !page) {
    const results = await SportsMatchs.aggregate([
      { $match: query },
      ...aggregateQuery,
    ]);
    return res.json({ results, count });
  } else {
    const results = await SportsMatchs.aggregate([
      { $match: query },
      ...aggregateQuery,
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]);
    return res.json({ results, count });
  }
};

export const create = async (req: Request, res: Response) => {
  const result = await SportsMatchs.create(req.body);
  return res.json(result);
};

export const updateOne = async (req: Request, res: Response) => {
  const query = { _id: ObjectId(req.params.id) };
  await SportsMatchs.updateOne(query, req.body);
  const result = await SportsMatchs.aggregate([
    { $match: query },
    ...aggregateQuery,
  ]);
  return res.json(result[0]);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await SportsMatchs.deleteOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};

export const deleteMatchs = async () => {
  const date = moment().subtract(1, "days").valueOf() / 1000;
  const result = await SportsMatchs.deleteMany({ time: { $lte: date } });
  return result;
};
