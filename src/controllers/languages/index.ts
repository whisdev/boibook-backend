import { Request, Response } from "express";
import { Language, LanguageWord } from "../../models";

export const getLanguage = async (req: Request, res: Response) => {
  const results = await Language.find().select({ value: 1, label: 1, _id: 0 });
  return res.json(results);
};

export const Word = async (req: Request, res: Response) => {
  let results = {} as any;
  const words: any = await LanguageWord.find()
    .select({ key: 1, [req.body.id]: 1, _id: 0 })
    .sort({ key: 1 });
  for (const i in words) {
    results[words[i].key as string] = words[i][req.body.id];
  }
  return res.json(results);
};

export const getWord = async (req: Request, res: Response) => {
  const result = await LanguageWord.find()
    .select({ key: 1, [req.params.id]: 1, _id: 0 })
    .sort({ key: 1 });
  return res.json(result);
};

export const getWords = async (req: Request, res: Response) => {
  const array = {} as any;
  const keys: any = await Language.find().select({ value: 1, _id: 0 });
  for (const i in keys) {
    const data: any = await LanguageWord.find()
      .select({ [keys[i].value]: 1, key: 1, _id: 0 })
      .sort({ key: 1 });
    let result = {} as any;
    for (const j in data) {
      result[data[j].key as string] = data[j][keys[i].value];
    }
    array[keys[i].value as string] = result;
  }
  return res.json(array);
};

export const updateWords = async (req: Request, res: Response) => {
  const data = req.body;
  const insertData = [] as any;
  for (const lng in data) {
    for (const key in data[lng]) {
      if (lng === "en") {
        insertData.push({ key: key, [lng]: data[lng][key] });
      } else {
        insertData[insertData.findIndex((e: any) => e.key === key)][lng] =
          data[lng][key];
      }
    }
  }
  const result1 = await LanguageWord.insertMany(insertData);
  return res.json(result1);
};

export const updateWord = async (req: Request, res: Response) => {
  const { string, key } = req.body;
  const id = req.params.id;
  const result = await LanguageWord.findOneAndUpdate(
    { key: key },
    { [id]: string },
    { new: true, upsert: true }
  ).select({ key: 1, [id]: 1, _id: 0 });
  return res.json(result);
};

export const deleteWord = async (req: Request, res: Response) => {
  const result = await LanguageWord.deleteOne({ key: req.params.id });
  return res.json(result);
};
