import { Schema, model } from "mongoose";

const BracketsMatchsSchema = new Schema(
  {
    sportId: {
      type: Number,
      require: true,
    },
    name: {
      type: String,
      require: true,
    },
    events: {
      type: Object,
      require: true,
    },
    time: {
      type: Date,
      require: true,
    },
    rounds: {
      type: Number,
      require: true,
    },
    time_status: {
      type: Number,
      default: 0,
      require: true,
    },
  },
  { timestamps: true }
);

export const BracketsMatchs = model("brackets_matchs", BracketsMatchsSchema);
