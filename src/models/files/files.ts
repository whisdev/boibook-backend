import { Schema, model } from "mongoose";

const filesSchema = new Schema(
  {
    filename: {
      type: String,
    },
    originalname: {
      type: String,
    },
    uri: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Files = model("files", filesSchema);
