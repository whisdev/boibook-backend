import { ObjectId } from "../base";
import { Permissions } from "../../models";
import { Request, Response } from "express";

export const get = async (req: Request, res: Response) => {
  const result = await Permissions.find();
  return res.json(result);
};

export const getOne = async (req: Request, res: Response) => {
  const result = await Permissions.findOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};

export const list = async (req: Request, res: Response) => {
  const { pageSize = null, page = null } = req.body;
  let query = {};
  const count = await Permissions.countDocuments(query);
  if (!pageSize || !page) {
    const results = await Permissions.find(query);
    return res.json({ results, count });
  } else {
    const results = await Permissions.find(query)
      .limit(pageSize)
      .skip((page - 1) * pageSize);
    return res.json({ results, count });
  }
};

export const label = async (req: Request, res: Response) => {
  const results = await Permissions.aggregate([
    {
      $project: {
        label: "$title",
        value: "$_id",
        _id: 0,
      },
    },
    {
      $sort: {
        order: 1,
      },
    },
  ]);
  return res.json(results);
};

export const create = async (req: Request, res: Response) => {
  const result = await Permissions.create(req.body);
  return res.json(result);
};

export const updateOne = async (req: Request, res: Response) => {
  const result = await Permissions.findByIdAndUpdate(
    ObjectId(req.params.id),
    req.body,
    { new: true }
  );
  return res.json(result);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await Permissions.deleteOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};
