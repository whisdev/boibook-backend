import { Schema, model } from "mongoose";

const GameListsSchema = new Schema(
  {
    id: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "",
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "game_providers",
    },
    img: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    overlay: {
      type: String,
      default: "",
    },
    rtp: {
      type: Number,
      default: 95,
    },
    order: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const GameLists = model("game_lists", GameListsSchema);
