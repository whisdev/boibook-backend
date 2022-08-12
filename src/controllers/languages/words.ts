import { ObjectId } from "../base";
import { LanguageWord } from "../../models";
import { Request, Response } from "express";

export const get = async (req: Request, res: Response) => {
  const data = await LanguageWord.find();
  return res.json(data);
};

export const create = async (req: Request, res: Response) => {
  const result = await LanguageWord.create(req.body);
  return res.json(result);
};

export const getOne = async (req: Request, res: Response) => {
  const result = await LanguageWord.findById(ObjectId(req.params.id));
  return res.json(result);
};

export const update = async (req: Request, res: Response) => {
  const result = await LanguageWord.findByIdAndUpdate(
    ObjectId(req.params.id),
    req.body,
    { new: true }
  );
  return res.json(result);
};

export const updateMany = async (req: Request, res: Response) => {
  const result = await LanguageWord.insertMany(req.body);
  return res.json(result);
};

export const deleteOne = async (req: Request, res: Response) => {
  const result = await LanguageWord.deleteOne({ _id: ObjectId(req.params.id) });
  return res.json(result);
};
