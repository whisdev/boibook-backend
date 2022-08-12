import { Schema, model } from "mongoose";

const SessionsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    socketId: {
      type: String,
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    passwordToken: {
      type: String,
    },
    expiration: {
      type: Date,
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
  },
  { timestamps: true }
);

export const Sessions = model("sessions", SessionsSchema);
