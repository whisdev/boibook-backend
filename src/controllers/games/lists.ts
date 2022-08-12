import { ObjectId } from "../base";
import { GameLists } from "../../models";
import { Request, Response } from "express";

export const get = async (req: Request, res: Response) => {
  const result = await GameLists.find()
    .sort({ status: -1, order: 1, createdAt: -1 })
    .populate("providerId");
  return res.json(result);
};

export const getOne = async (req: Request, res: Response) => {
  const result = await GameLists.findOne({
    _id: ObjectId(req.params.id),
  }).populate("providerId");
  return res.json(result);
};

export const list = async (req: Request, res: Response) => {
  const { pageSize = null, page = null } = req.body;
  let query = {};
  const count = await GameLists.countDocuments(query);
  if (!pageSize || !page) {
    const results = await GameLists.find(query)
      .sort({ status: -1, order: 1, createdAt: -1 })
      .populate("providerId");
    return res.json({ results, count });
  } else {
    const results = await GameLists.find(query)
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .sort({ status: -1, order: 1, createdAt: -1 })
      .populate("providerId");
    return res.json({ results, count });
  }
};

export const label = async (req: Request, res: Response) => {
  const results = await GameLists.aggregate([
    {
      $match: { status: true },
    },
    {
      $project: {
        label: "$symbol",
        value: "$_id",
        _id: 0,
      },
    },
    {
      $sort: {
        label: 1,
      },
    },
  ]);
  return res.json(results);
};

export const create = async (req: Request, res: Response) => {
  const result = await GameLists.create(req.body);
  return res.json(result);
};

export const updateOne = async (req: Request, res: Response) => {
  const result = await GameLists.findByIdAndUpdate(
    ObjectId(req.params.id),
    req.body,
    { new: true }
  ).populate("providerId");
  return res.json(result);
};

export const updateMany = async (req: Request, res: Response) => {
  const result = await GameLists.insertMany(req.body);
  return res.json(result);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await GameLists.deleteOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};
