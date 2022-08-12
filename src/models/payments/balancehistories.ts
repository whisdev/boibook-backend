import { Schema, model } from "mongoose";

const BalanceHistoriesSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    currency: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "currencies",
    },
    amount: {
      type: Number,
      default: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    beforeBalance: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
    },
    info: {
      type: String,
    },
  },
  { timestamps: true }
);

BalanceHistoriesSchema.pre("findOneAndUpdate", function () {
  this.populate("currency");
});

BalanceHistoriesSchema.pre("find", function () {
  this.populate("currency");
});

BalanceHistoriesSchema.pre("findOne", function () {
  this.populate("currency");
});

export const BalanceHistories = model(
  "balancehistories",
  BalanceHistoriesSchema
);
