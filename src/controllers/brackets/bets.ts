import { ObjectId } from "../base";
import { BracketsBets } from "../../models";
import { Request, Response } from "express";

const aggregateQuery = [
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user",
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
    $unwind: "$user",
  },
  {
    $unwind: "$currency",
  },
  {
    $project: { "currency.abi": 0 },
  },
  {
    $sort: { createdAt: -1 },
  },
] as any;

export const get = async (req: Request, res: Response) => {
  const result = await BracketsBets.aggregate(aggregateQuery);
  return res.json(result);
};

export const getOne = async (req: Request, res: Response) => {
  const result = await BracketsBets.aggregate([
    { $match: { _id: ObjectId(req.params.id) } },
    ...aggregateQuery,
  ]);
  return res.json(result[0]);
};

export const list = async (req: Request, res: Response) => {
  const {
    userId = null,
    currency = null,
    status = null,
    sort = null,
    column = null,
    date = null,
    page = null,
    pageSize = null,
  } = req.body;

  let query = {} as any;
  let sortQuery = { createdAt: -1 } as any;
  if (userId) {
    query.userId = ObjectId(userId);
  }
  if (status) {
    query.status = status;
  }
  if (currency) {
    query.currency = ObjectId(currency);
  }
  if (date && date[0] && date[1]) {
    query.createdAt = { $gte: new Date(date[0]), $lte: new Date(date[1]) };
  }
  if (column) {
    sortQuery = { [column]: sort ? sort : 1 };
  }
  const count = await BracketsBets.countDocuments(query);
  if (!pageSize || !page) {
    const results = await BracketsBets.aggregate([
      { $match: query },
      ...aggregateQuery,
      { $sort: sortQuery },
    ]);
    return res.json({ results, count });
  } else {
    const results = await BracketsBets.aggregate([
      { $match: query },
      ...aggregateQuery,
      { $sort: sortQuery },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]);
    return res.json({ results, count });
  }
};

export const create = async (req: Request, res: Response) => {
  const result = await BracketsBets.create(req.body);
  return res.json(result);
};

export const updateOne = async (req: Request, res: Response) => {
  const query = { _id: ObjectId(req.params.id) };
  await BracketsBets.updateOne(query, req.body);
  const result = await BracketsBets.aggregate([
    { $match: query },
    ...aggregateQuery,
  ]);
  return res.json(result[0]);
};

export const updateMany = async (req: Request, res: Response) => {
  const result = await BracketsBets.insertMany(req.body);
  return res.json(result);
};

export const deleteAll = async (req: Request, res: Response) => {
  const result = await BracketsBets.deleteMany();
  return res.json(result);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await BracketsBets.deleteOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};
