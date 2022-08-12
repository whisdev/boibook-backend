import { ObjectId } from "../base";
import { updateBracketPoint } from ".";
import { BracketsMatchs } from "../../models";
import { Request, Response } from "express";

const aggregateQuery = [
  {
    $lookup: {
      from: "sports_lists",
      localField: "sportId",
      foreignField: "SportId",
      as: "sport",
    },
  },
  {
    $unwind: "$sport",
  },
] as any;

export const get = async (req: Request, res: Response) => {
  const result = await BracketsMatchs.aggregate(aggregateQuery);
  return res.json(result);
};

export const getOne = async (req: Request, res: Response) => {
  const result = await BracketsMatchs.aggregate([
    { $match: { _id: ObjectId(req.params.id) } },
    ...aggregateQuery,
  ]);
  return res.json(result[0]);
};

export const list = async (req: Request, res: Response) => {
  const {
    sort = null,
    column = null,
    date = null,
    page = null,
    pageSize = null,
  } = req.body;
  let query = {} as any;
  let sortQuery = { createdAt: -1 } as any;
  if (date && date[0] && date[1]) {
    query.createdAt = { $gte: new Date(date[0]), $lte: new Date(date[1]) };
  }
  if (column) {
    sortQuery = { [column]: sort ? sort : 1 };
  }
  const count = await BracketsMatchs.countDocuments(query);
  if (!pageSize || !page) {
    const results = await BracketsMatchs.aggregate([
      { $match: query },
      ...aggregateQuery,
      { $sort: sortQuery },
    ]);
    return res.json({ results, count });
  } else {
    const results = await BracketsMatchs.aggregate([
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
  const result = await BracketsMatchs.create(req.body);
  return res.json(result);
};

export const update = async (req: Request, res: Response) => {
  const _id = ObjectId(req.params.id);
  const query = { _id };
  await BracketsMatchs.updateOne(query, req.body);
  await updateBracketPoint(String(_id));
  const result = await BracketsMatchs.aggregate([
    { $match: query },
    ...aggregateQuery,
  ]);
  return res.json(result[0]);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await BracketsMatchs.deleteOne({
    _id: ObjectId(req.params.id),
  });
  return res.json(result);
};

export const deleteAll = async (req: Request, res: Response) => {
  const result = await BracketsMatchs.deleteMany();
  return res.json(result);
};
