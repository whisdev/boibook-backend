import { Schema, model } from "mongoose";

const SportsBetsSchema = new Schema(
  {
    betsId: {
      type: String,
      default: "",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    currency: {
      type: Schema.Types.ObjectId,
      ref: "currencies",
    },
    odds: {
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
    potential: {
      type: Number,
      require: true,
    },
    type: {
      type: String,
      require: true,
    },
    betType: {
      type: Number,
      require: true,
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

SportsBetsSchema.pre("findOneAndUpdate", function () {
  this.populate("userId").populate("currency");
});

SportsBetsSchema.pre("findOne", function () {
  this.populate("userId").populate("currency");
});

SportsBetsSchema.pre("find", function () {
  this.populate("userId").populate("currency");
});

export const SportsBets = model("sports_bets", SportsBetsSchema);
