import { Schema, model } from "mongoose";

const BracketsBetsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      require: true,
    },
    currency: {
      type: Schema.Types.ObjectId,
      ref: "currencies",
      require: true,
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "brackets_matchs",
      require: true,
    },
    stake: {
      type: Number,
      require: true,
    },
    bracket: {
      type: Object,
      require: true,
    },
    point: {
      type: Number,
      require: true,
      default: 0,
    },
    status: {
      type: String,
      default: "BET",
      enum: [
        "BET",
        "SETTLED",
        "LOST",
        "WIN",
        "HALF_WIN",
        "HALF_LOST",
        "REFUND",
        "CANCEL",
      ],
      require: true,
    },
  },
  { timestamps: true }
);

export const BracketsBets = model("brackets_bets", BracketsBetsSchema);
