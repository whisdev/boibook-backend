import { ObjectId } from "../base";
import { Language } from "../../models";
import { Request, Response } from "express";

export const get = async (req: Request, res: Response) => {
  const data = await Language.find();
  return res.json(data);
};

export const create = async (req: Request, res: Response) => {
  const result = await Language.create(req.body);
  return res.json(result);
};

export const getOne = async (req: Request, res: Response) => {
  const result = await Language.findById(ObjectId(req.params.id));
  return res.json(result);
};

export const update = async (req: Request, res: Response) => {
  const result = await Language.findByIdAndUpdate(
    ObjectId(req.params.id),
    req.body,
    { new: true }
  );
  return res.json(result);
};

export const updateMany = async (req: Request, res: Response) => {
  const result = await Language.insertMany(req.body);
  return res.json(result);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await Language.deleteOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};
