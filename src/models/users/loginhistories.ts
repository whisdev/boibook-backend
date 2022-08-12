import { Schema, model } from "mongoose";

const LoginHistoriesSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    ip: {
      type: String,
    },
    country: {
      type: String,
    },
    range: {
      type: Object,
    },
    useragent: {
      type: Object,
    },
    data: {
      type: Object,
    },
  },
  { timestamps: true }
);

export const LoginHistories = model("loginhistories", LoginHistoriesSchema);
