import "dotenv/config";
import "regenerator-runtime";
import mongoose from "mongoose";
import { Result } from "./controllers/sports/sportsresult";

mongoose.connect(process.env.DATABASE as string).then(() => {
  Result();
});
