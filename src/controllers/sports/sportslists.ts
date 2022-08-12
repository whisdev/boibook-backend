import { ObjectId } from "../base";
import { SportsLists } from "../../models";
import { Request, Response } from "express";

export const get = async (req: Request, res: Response) => {
  const result = await SportsLists.find().sort({ order: 1 });
  return res.json(result);
};

export const getOne = async (req: Request, res: Response) => {
  const result = await SportsLists.findOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};

export const list = async (req: Request, res: Response) => {
  const { pageSize = null, page = null } = req.body;
  let query = {};
  const count = await SportsLists.countDocuments(query);
  if (!pageSize || !page) {
    const results = await SportsLists.find(query).sort({ order: 1 });
    return res.json({ results, count });
  } else {
    const results = await SportsLists.find(query)
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .sort({ order: 1 });
    return res.json({ results, count });
  }
};

export const label = async (req: Request, res: Response) => {
  const results = await SportsLists.aggregate([
    {
      $sort: {
        order: 1,
      },
    },
    {
      $project: {
        label: "$SportName",
        value: "$SportId",
        icon: {
          icon: "$icon",
          color: "$color",
        },
        _id: 0,
      },
    },
  ]);
  return res.json(results);
};

export const create = async (req: Request, res: Response) => {
  const result = await SportsLists.create(req.body);
  return res.json(result);
};

export const updateOne = async (req: Request, res: Response) => {
  const result = await SportsLists.findByIdAndUpdate(
    ObjectId(req.params.id),
    req.body,
    { new: true }
  );
  return res.json(result);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await SportsLists.deleteOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};
