import { Schema, model } from "mongoose";

const SportsBettingSchema = new Schema(
  {
    betId: {
      type: Schema.Types.ObjectId,
      ref: "bets",
    },
    eventId: {
      type: Number,
      require: true,
    },
    stake: {
      type: Number,
      require: true,
    },
    profit: {
      type: Number,
      default: 0,
      require: true,
    },
    SportId: {
      type: Number,
      require: true,
    },
    SportName: {
      type: String,
      require: true,
    },
    LeagueId: {
      type: Number,
      require: true,
    },
    LeagueName: {
      type: String,
      require: true,
    },
    TimeStatus: {
      type: String,
      require: true,
    },
    Time: {
      type: Date,
      require: true,
    },
    AwayTeam: {
      type: String,
      require: true,
    },
    HomeTeam: {
      type: String,
      require: true,
    },
    marketId: {
      type: String,
      require: true,
    },
    marketName: {
      type: String,
      require: true,
    },
    oddId: {
      type: Number,
      require: true,
    },
    oddName: {
      type: String,
      require: true,
    },
    oddType: {
      type: String,
      require: true,
    },
    odds: {
      type: Number,
      require: true,
    },
    oddData: {
      type: Object,
      require: true,
    },
    scores: {
      type: Object,
      default: {
        home: 0,
        away: 0,
        total: 0,
      },
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

export const SportsBetting = model("sports_bettings", SportsBettingSchema);
