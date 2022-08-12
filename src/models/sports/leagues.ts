import { Schema, model } from "mongoose";

const SportsLeaguesSchema = new Schema(
  {
    id: {
      type: Number,
      unique: true,
    },
    sport_id: {
      type: Number,
    },
    name: {
      type: String,
    },
    cc: {
      type: String,
    },
    has_leaguetable: {
      type: String,
    },
    has_toplist: {
      type: String,
    },
    order: {
      type: Number,
      default: 99999,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const SportsLeagues = model("sports_leagues", SportsLeaguesSchema);
