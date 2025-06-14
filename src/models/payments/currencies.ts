import { Schema, model } from "mongoose";

const CurrenciesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    // payment: {
    //   type: String,
    // },
    // buyUrl: {
    //   type: String,
    // },
    coingecko: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    minDeposit: {
      type: Number,
      default: 0,
    },
    minWithdraw: {
      type: Number,
      default: 0,
    },
    minBet: {
      type: Number,
      default: 0,
    },
    maxBet: {
      type: Number,
      default: 0,
    },
    betLimit: {
      type: Number,
      default: 0,
    },
    // adminAddress: {
    //   type: String,
    //   default: "",
    // },
    tokenMintAccount: {
      type: String,
      default: "",
    },
    network: {
      type: String,
      default: "",
    },
    // abi: {
    //   type: Array,
    //   default: [],
    // },
    decimals: {
      type: Number,
      default: 18,
    },
    status: {
      type: Boolean,
      default: true,
    },
    deposit: {
      type: Boolean,
      default: true,
    },
    withdrawal: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
    },
    // officialLink: {
    //   type: String,
    //   default: "",
    // },
  },
  { timestamps: true }
);

export const Currencies = model("currencies", CurrenciesSchema);
