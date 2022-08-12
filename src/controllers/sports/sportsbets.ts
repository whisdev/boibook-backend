import { ObjectId } from "../base";
import { SportsBets } from "../../models";
import { Request, Response } from "express";

export const aggregateQuery = [
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
    $unwind: "$user",
  },
  {
    $project: { "currency.abi": 0 },
  },
  {
    $sort: { createdAt: -1 },
  },
] as any;

export const get = async (req: Request, res: Response) => {
  const result = await SportsBets.aggregate(aggregateQuery);
  return res.json(result);
};

export const getOne = async (req: Request, res: Response) => {
  const result = await SportsBets.aggregate([
    { $match: { _id: ObjectId(req.params.id) } },
    ...aggregateQuery,
  ]);
  return res.json(result[0]);
};

export const list = async (req: Request, res: Response) => {
  const {
    betId = null,
    userId = null,
    SportId = null,
    currency = null,
    type = null,
    status = null,
    sort = null,
    column = null,
    date = null,
    page = null,
    pageSize = null,
  } = req.body;

  let query = {} as any;
  let sortQuery = { createdAt: -1 } as any;
  if (betId) {
    query._id = ObjectId(betId);
  }
  if (userId) {
    query.userId = ObjectId(userId);
  }
  if (type) {
    query.type = type;
  }
  if (status) {
    query.status = status;
  }
  if (currency) {
    query.currency = ObjectId(currency);
  }
  if (SportId || SportId === 0) {
    query.betType = SportId;
  }
  if (date && date[0] && date[1]) {
    query.createdAt = { $gte: new Date(date[0]), $lte: new Date(date[1]) };
  }
  if (column) {
    sortQuery = { [column]: sort ? sort : 1 };
  }
  const count = await SportsBets.countDocuments(query);
  if (!pageSize || !page) {
    const results = await SportsBets.aggregate([
      { $match: query },
      ...aggregateQuery,
      { $sort: sortQuery },
    ]);
    return res.json({ results, count });
  } else {
    const results = await SportsBets.aggregate([
      { $match: query },
      ...aggregateQuery,
      { $sort: sortQuery },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]);
    return res.json({ results, count });
  }
};

export const label = async (req: Request, res: Response) => {
  const results = await SportsBets.aggregate([
    {
      $project: {
        label: "$_id",
        value: "$_id",
        _id: 0,
      },
    },
  ]);
  return res.json(results);
};

export const csv = async (req: Request, res: Response) => {
  const {
    betId = null,
    userId = null,
    type = null,
    status = null,
    currency = null,
    date = null,
    SportId = null,
  } = req.body;
  let query = {} as any;
  if (betId) {
    query._id = ObjectId(betId);
  }
  if (userId) {
    query.userId = ObjectId(userId);
  }
  if (type) {
    query.type = type;
  }
  if (status) {
    query.status = status;
  }
  if (currency) {
    query.currency = ObjectId(currency);
  }
  if (SportId || SportId === 0) {
    query.betType = SportId;
  }
  if (date && date[0] && date[1]) {
    query.createdAt = { $gte: new Date(date[0]), $lte: new Date(date[1]) };
  }
  const results = await SportsBets.aggregate([
    { $match: query },
    ...aggregateQuery,
    {
      $project: {
        _id: 0,
        BetId: "$_id",
        Username: "$user.username",
        Email: "$user.email",
        Sports: {
          $substr: [
            {
              $reduce: {
                input: "$bettings.SportName",
                initialValue: "",
                in: { $concat: ["$$this", ", ", "$$value"] },
              },
            },
            0,
            {
              $subtract: [
                {
                  $strLenCP: {
                    $reduce: {
                      input: "$bettings.SportName",
                      initialValue: "",
                      in: { $concat: ["$$this", ", ", "$$value"] },
                    },
                  },
                },
                2,
              ],
            },
          ],
        },
        Stake: {
          $concat: [
            { $convert: { input: "$stake", to: "string" } },
            " ",
            "$currency.symbol",
          ],
        },
        Potential: {
          $concat: [
            { $convert: { input: "$potential", to: "string" } },
            " ",
            "$currency.symbol",
          ],
        },
        Type: "$type",
        Status: "$status",
        Time: "$createdAt",
      },
    },
  ]);
  return res.json(results);
};

export const create = async (req: Request, res: Response) => {
  const result = await SportsBets.create(req.body);
  return res.json(result);
};

export const updateOne = async (req: Request, res: Response) => {
  const query = { _id: ObjectId(req.params.id) };
  await SportsBets.updateOne(query, req.body);
  const result = await SportsBets.aggregate([
    { $match: query },
    ...aggregateQuery,
  ]);
  return res.json(result[0]);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await SportsBets.deleteOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};
