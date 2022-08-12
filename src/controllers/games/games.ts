import { ObjectId } from "../base";
import { Games } from "../../models";
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
    $lookup: {
      from: "game_providers",
      localField: "providerId",
      foreignField: "_id",
      as: "provider",
    },
  },
  {
    $lookup: {
      from: "game_lists",
      localField: "gameId",
      foreignField: "_id",
      as: "game",
    },
  },
  {
    $unwind: "$user",
  },
  {
    $unwind: "$game",
  },
  {
    $unwind: "$currency",
  },
  {
    $unwind: "$provider",
  },
  {
    $project: {
      "currency.abi": 0,
    },
  },
  {
    $sort: { createdAt: -1 },
  },
];

export const get = async (req: Request, res: Response) => {
  const results = await Games.aggregate(aggregateQuery as any);
  return res.json(results);
};

export const getOne = async (req: Request, res: Response) => {
  const result = await Games.aggregate([
    {
      $match: { _id: ObjectId(req.params.id) },
    },
    ...(aggregateQuery as any),
  ]);
  return res.json(result[0]);
};

export const list = async (req: Request, res: Response) => {
  const {
    pageSize = null,
    page = null,
    userId = null,
    currency = null,
    status = null,
    gameId = null,
    providerId = null,
    date = null,
    sort = null,
    column = null,
  } = req.body;
  let query = {} as any;
  let sortQuery = { createdAt: -1 } as any;
  if (column) {
    sortQuery = { [column]: sort ? sort : 1 };
  }
  if (userId) {
    query.userId = ObjectId(userId);
  }
  if (currency) {
    query.currency = ObjectId(currency);
  }
  if (gameId) {
    query.gameId = ObjectId(gameId);
  }
  if (providerId) {
    query.providerId = ObjectId(providerId);
  }
  if (status) {
    query.status = status;
  }
  if (date && date[0] && date[1]) {
    query.createdAt = { $gte: new Date(date[0]), $lte: new Date(date[1]) };
  }
  const count = await Games.countDocuments(query);
  if (!pageSize || !page) {
    const results = await Games.aggregate([
      { $match: query },
      ...aggregateQuery,
      { $sort: sortQuery },
    ]);
    return res.json({ results, count });
  } else {
    const results = await Games.aggregate([
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
    status = null,
    gameId = null,
    providerId = null,
    date = null,
    sort = null,
    column = null,
  } = req.body;
  let query = {} as any;
  let sortQuery = { createdAt: -1 } as any;
  if (column) {
    sortQuery = { [column]: sort ? sort : 1 };
  }
  if (userId) {
    query.userId = ObjectId(userId);
  }
  if (currency) {
    query.currency = ObjectId(currency);
  }
  if (gameId) {
    query.gameId = ObjectId(gameId);
  }
  if (providerId) {
    query.providerId = ObjectId(providerId);
  }
  if (status) {
    query.status = status;
  }
  if (date && date[0] && date[1]) {
    query.createdAt = { $gte: new Date(date[0]), $lte: new Date(date[1]) };
  }
  const results = await Games.aggregate([
    { $match: query },
    ...aggregateQuery,
    { $sort: sortQuery },
    {
      $project: {
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
  const result = await Games.create(req.body);
  return res.json(result);
};

export const updateOne = async (req: Request, res: Response) => {
  const query = { _id: ObjectId(req.params.id) };
  await Games.updateOne(query, req.body);
  const result = await Games.aggregate([
    { $match: query },
    ...(aggregateQuery as any),
  ]);
  return res.json(result[0]);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await Games.deleteOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};
