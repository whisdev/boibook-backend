import { Schema, model } from "mongoose";

const advertisementsSchema = new Schema(
  {
    order: {
      type: Number,
    },
    title: {
      type: String,
    },
    uri: {
      type: String,
    },
    status: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

export const Advertisements = model("advertisements", advertisementsSchema);
