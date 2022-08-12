import { Schema, model } from "mongoose";

const GameProvidersSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    inputPercentage: {
      type: Number,
      required: true,
    },
    outputPercentage: {
      type: Number,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

export const GameProviders = model("game_providers", GameProvidersSchema);
