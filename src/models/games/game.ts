import { Schema, model } from "mongoose";

const GamesSchema = new Schema(
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
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "game_providers",
      require: true,
    },
    gameId: {
      type: Schema.Types.ObjectId,
      ref: "game_lists",
      require: true,
    },
    odds: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    profit: {
      type: Number,
      default: 0,
      require: true,
    },
    betting: {
      type: Object,
    },
    aBetting: {
      type: Object,
    },
    status: {
      type: String,
      default: "BET",
      enum: ["BET", "DRAW", "LOST", "WIN"],
      require: true,
    },
  },
  { timestamps: true }
);

export const Games = model("games", GamesSchema);
