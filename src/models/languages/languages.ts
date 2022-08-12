import { Schema, model } from "mongoose";

const languagesSchema = new Schema(
  {
    label: {
      type: String,
    },
    value: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Language = model("languages", languagesSchema);
