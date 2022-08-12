import { ObjectId } from "../base";
import { Currencies } from "../../models";
import { Request, Response } from "express";

export const get = async (req: Request, res: Response) => {
  const result = await Currencies.find().sort({ status: -1, createdAt: -1 });
  return res.json(result);
};

export const getOne = async (req: Request, res: Response) => {
  const result = await Currencies.findOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};

export const list = async (req: Request, res: Response) => {
  const { pageSize = null, page = null } = req.body;
  let query = {};
  const count = await Currencies.countDocuments(query);
  if (!pageSize || !page) {
    const results = await Currencies.find(query).sort({
      status: -1,
      order: 1,
      createdAt: -1,
    });
    return res.json({ results, count });
  } else {
    const results = await Currencies.find(query)
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .sort({ status: -1, order: 1, createdAt: -1 });
    return res.json({ results, count });
  }
};

export const label = async (req: Request, res: Response) => {
  const results = await Currencies.aggregate([
    {
      $match: { status: true },
    },
    {
      $project: {
        label: "$symbol",
        value: "$_id",
        icon: "$icon",
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
  const result = await Currencies.create(req.body);
  return res.json(result);
};

export const updateOne = async (req: Request, res: Response) => {
  const result = await Currencies.findByIdAndUpdate(
    ObjectId(req.params.id),
    req.body,
    { new: true }
  );
  return res.json(result);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await Currencies.deleteOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};
