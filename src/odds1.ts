import "dotenv/config";
import "regenerator-runtime";
import mongoose from "mongoose";
import { Odds1 } from "./controllers/sports/sportsrealtime";

try {
  mongoose.connect(process.env.DATABASE as string).then(() => {
    Odds1();
  });
} catch (error) {
  console.log(`Odds1`, error);
}
