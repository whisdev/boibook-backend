import "dotenv/config";
import "regenerator-runtime";
import mongoose from "mongoose";
import { Odds } from "./controllers/sports/sportsrealtime";

try {
  mongoose.connect(process.env.DATABASE as string).then(() => {
    Odds();
  });
} catch (error) {
  console.log(`Odds`, error);
}
