import { Schema, model } from "mongoose";

const PaymentsSchema = new Schema(
  {
    balanceId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "balances",
    },
    currencyId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "currencies",
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    address: {
      type: String,
    },
    amount: {
      type: Number,
    },
    amounti: {
      type: Number,
    },
    currency: {
      type: String,
    },
    id: {
      type: String,
    },
    ipn_id: {
      type: String,
    },
    ipn_mode: {
      type: String,
    },
    ipn_type: {
      type: String,
    },
    merchant: {
      type: String,
    },
    status: {
      type: Number,
    },
    status_text: {
      type: String,
    },
    signature: {
      type: String,
    },
    method: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Payments = model("payments", PaymentsSchema);
