import * as fs from "fs";
import { Files } from "../../models";
import { Request, Response } from "express";
const config = require("../../../config");

export const upload = async (req: Request, res: Response) => {
  if (!req.files || req.files.length <= 0) {
    return res.status(400).json("error");
  }
  const files = req.files as any;
  if (files.length > 1) {
    const data = [] as any;
    for (const i in files) {
      const filename = files[i].filename;
      const originalname = files[i].originalname;
      const type = originalname
        .slice(originalname.lastIndexOf("."))
        .toLowerCase();
      data.push({ filename, originalname, type, uri: filename });
    }
    const result = await Files.insertMany(data);
    return res.json(result);
  } else {
    const filename = files[0].filename;
    const originalname = files[0].originalname;
    const type = originalname
      .slice(originalname.lastIndexOf("."))
      .toLowerCase();
    const data = { filename, originalname, type, uri: filename };
    const result = await Files.create(data);
    return res.json(result);
  }
};

export const deleteURI = async (req: Request, res: Response) => {
  const { uri } = req.body;
  console.log("uri", uri);
  const data = await Files.findOneAndDelete({ uri });
  const path = `${config.DIR}/upload/${data?.filename}`;
  try {
    fs.unlinkSync(path);
  } catch (err) {
    console.log(err);
  }
  return res.json(data);
};
