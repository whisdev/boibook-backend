import "dotenv/config";
import "regenerator-runtime";
import mongoose from "mongoose";
import { Odds2 } from "./controllers/sports/sportsrealtime";

try {
  mongoose.connect(process.env.DATABASE as string).then(() => {
    Odds2();
  });
} catch (error) {
  console.log(`Odds2`, error);
}
