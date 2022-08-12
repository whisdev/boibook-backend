import { ObjectId } from "../base";
import { Balances } from "../../models";
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
    $project: {
      "currency.abi": 0,
    },
  },
] as any;

export const get = async (req: Request, res: Response) => {
  const results = await Balances.aggregate(aggregateQuery);
  return res.json(results);
};

export const getOne = async (req: Request, res: Response) => {
  const result = await Balances.aggregate([
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
    userId = null,
    currency = null,
    date = null,
    sort = null,
    column = null,
    hide = null,
  } = req.body;
  let query = {} as any;
  let sortQuery = { createdAt: 1 } as any;
  if (hide) {
    query.balance = { $ne: 0 };
  }
  if (column) {
    sortQuery = { [column]: sort ? sort : 1 };
  }
  if (userId) {
    query.userId = ObjectId(userId);
  }
  if (currency) {
    query.currency = ObjectId(currency);
  }
  if (date && date[0] && date[1]) {
    query.createdAt = { $gte: new Date(date[0]), $lte: new Date(date[1]) };
  }
  const count = await Balances.countDocuments(query);
  if (!pageSize || !page) {
    const results = await Balances.aggregate([
      { $match: query },
      ...aggregateQuery,
      { $sort: sortQuery },
    ]);
    return res.json({ results, count });
  } else {
    const results = await Balances.aggregate([
      { $match: query },
      ...aggregateQuery,
      { $sort: sortQuery },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]);
    return res.json({ results, count });
  }
};

export const csv = async (req: Request, res: Response) => {
  const {
    userId = null,
    currency = null,
    date = null,
    sort = null,
    column = null,
    hide = null,
  } = req.body;
  let query = {} as any;
  let sortQuery = {} as any;
  if (hide) {
    query.balance = { $ne: 0 };
  }
  if (column) {
    sortQuery = { [column]: sort ? sort : 1 };
  } else {
    sortQuery = { createdAt: 1 };
  }
  if (userId) {
    query.userId = ObjectId(userId);
  }
  if (currency) {
    query.currency = ObjectId(currency);
  }
  if (date && date[0] && date[1]) {
    query.createdAt = { $gte: new Date(date[0]), $lte: new Date(date[1]) };
  }
  const results = await Balances.aggregate([
    { $match: query },
    ...aggregateQuery,
    { $sort: sortQuery },
    {
      $project: {
        _id: 0,
        Username: "$user.username",
        Email: "$user.email",
        Balance: {
          $concat: [
            { $convert: { input: "$balance", to: "string" } },
            " ",
            "$currency.symbol",
          ],
        },
      },
    },
  ]);
  return res.json(results);
};

export const create = async (req: Request, res: Response) => {
  const result = await Balances.create(req.body);
  return res.json(result);
};

export const updateOne = async (req: Request, res: Response) => {
  const query = { _id: ObjectId(req.params.id) };
  await Balances.updateOne(query, req.body);
  const result = await Balances.aggregate([
    { $match: query },
    ...aggregateQuery,
  ]);
  return res.json(result[0]);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await Balances.deleteOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};
