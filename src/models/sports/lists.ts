import { Schema, model } from "mongoose";

const SportsListsSchema = new Schema(
  {
    SportId: {
      type: Number,
      required: true,
      unique: true,
    },
    SportName: {
      type: String,
      required: true,
      unique: true,
    },
    icon: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "",
    },
    draw: {
      type: Boolean,
      default: false,
    },
    live: {
      type: Boolean,
      default: true,
    },
    upcoming: {
      type: Boolean,
      default: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      required: true,
    },
    img: {
      type: String,
    },
  },
  { timestamps: true }
);

export const SportsLists = model("sports_lists", SportsListsSchema);
