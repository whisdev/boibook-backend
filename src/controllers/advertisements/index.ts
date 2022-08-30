import { ObjectId } from "../base";
import { Advertisements } from "../../models";
import { Request, Response } from "express";

export const getOne = async (req: Request, res: Response) => {
  const result: any = await Advertisements.findOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};

export const get = async (req: Request, res: Response) => {
  const ads = await Advertisements.find({ status: true });
  return res.json(ads);
};

export const list = async (req: Request, res: Response) => {
  const { pageSize = null, page = null } = req.body;
  let query = { status: true };
  const count = await Advertisements.countDocuments(query);
  if (!pageSize || !page) {
    const results = await Advertisements.find(query).sort({ order: 1 });
    return res.json({ results, count });
  } else {
    const results = await Advertisements.find(query)
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .sort({ order: 1 });
    return res.json({ results, count });
  }
};

export const create = async (req: Request, res: Response) => {
  const result = await Advertisements.create(req.body);
  return res.json(result);
};

export const updateOne = async (req: Request, res: Response) => {
  const result = await Advertisements.findByIdAndUpdate(
    ObjectId(req.params.id),
    req.body,
    { new: true }
  );
  return res.json(result);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await Advertisements.deleteOne({
    _id: ObjectId(req.params.id),
  });
  return res.json(result);
};
