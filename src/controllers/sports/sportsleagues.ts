import { ObjectId } from "../base";
import { getLeaguePage } from "./sportsrealtime";
import { SportsLeagues, SportsLists } from "../../models";
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
      status: -1,
      order: 1,
      cc: -1,
      name: 1,
    },
  },
] as any;

export const get = async (req: Request, res: Response) => {
  const result = await SportsLeagues.aggregate(aggregateQuery);
  return res.json(result);
};

export const getOne = async (req: Request, res: Response) => {
  const result = await SportsLeagues.aggregate([
    {
      $match: { _id: ObjectId(req.params.id) },
    },
    ...aggregateQuery,
  ]);
  return res.json(result[0]);
};

export const list = async (req: Request, res: Response) => {
  const {
    pageSize = null,
    page = null,
    SportId,
    status,
    country,
    q,
  } = req.body;
  let query = {} as any;
  if (SportId !== "" && SportId !== undefined) {
    query.sport_id = SportId;
  }
  if (status !== "" && status !== undefined) {
    query.status = status;
  }
  if (country !== "" && country !== undefined) {
    query.cc = country.toLowerCase();
  }
  if (q !== "" && q !== undefined) {
    query.name = { $regex: q, $options: "i" };
  }
  const count = await SportsLeagues.countDocuments(query);
  if (!pageSize || !page) {
    const results = await SportsLeagues.aggregate([
      { $match: query },
      ...aggregateQuery,
    ]);
    return res.json({ results, count });
  } else {
    const results = await SportsLeagues.aggregate([
      { $match: query },
      ...aggregateQuery,
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]);
    return res.json({ results, count });
  }
};

export const create = async (req: Request, res: Response) => {
  const result = await SportsLeagues.create(req.body);
  return res.json(result);
};

export const updateOne = async (req: Request, res: Response) => {
  const query = { _id: ObjectId(req.params.id) };
  await SportsLeagues.updateOne(query, req.body);
  const result = await SportsLeagues.aggregate([
    { $match: query },
    ...aggregateQuery,
  ]);
  return res.json(result[0]);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await SportsLeagues.deleteOne({
    _id: ObjectId(req.params.id),
  });
  return res.json(result);
};

export const updateLeagues = async (req: Request, res: Response) => {
  const sportslist = await SportsLists.find();
  for (const key in sportslist) {
    getLeaguePage(sportslist[key].SportId);
  }
  res.json({ status: true });
};

export const allActive = async (req: Request, res: Response) => {
  const { status } = req.body;
  const result = await SportsLeagues.updateMany({ status });
  res.json(result);
};
