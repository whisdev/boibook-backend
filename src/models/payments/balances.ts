import { Schema, model } from "mongoose";

const BalancesSchema = new Schema(
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
    balance: {
      type: Number,
      default: 0,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

BalancesSchema.pre("findOneAndUpdate", function () {
  this.populate("currency");
});

BalancesSchema.pre("find", function () {
  this.populate("currency");
});

BalancesSchema.pre("findOne", function () {
  this.populate("currency");
});

export const Balances = model("balances", BalancesSchema);
