import { Schema, model } from "mongoose";

const PermissionsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Permissions = model("permissions", PermissionsSchema);
