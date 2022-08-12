import { ObjectId } from "../base";
import { GameProviders } from "../../models";
import { Request, Response } from "express";

export const get = async (req: Request, res: Response) => {
  const result = await GameProviders.find().sort({ status: -1, createdAt: -1 });
  return res.json(result);
};

export const getOne = async (req: Request, res: Response) => {
  const result = await GameProviders.findOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};

export const list = async (req: Request, res: Response) => {
  const { pageSize = null, page = null } = req.body;
  let query = {};
  const count = await GameProviders.countDocuments(query);
  if (!pageSize || !page) {
    const results = await GameProviders.find(query).sort({
      status: -1,
      createdAt: -1,
    });
    return res.json({ results, count });
  } else {
    const results = await GameProviders.find(query)
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .sort({ status: -1, createdAt: -1 });
    return res.json({ results, count });
  }
};

export const label = async (req: Request, res: Response) => {
  const results = await GameProviders.aggregate([
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
  const result = await GameProviders.create(req.body);
  return res.json(result);
};

export const updateOne = async (req: Request, res: Response) => {
  const result = await GameProviders.findByIdAndUpdate(
    ObjectId(req.params.id),
    req.body,
    { new: true }
  );
  return res.json(result);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await GameProviders.deleteOne({
    _id: ObjectId(req.params.id),
  });
  return res.json(result);
};
