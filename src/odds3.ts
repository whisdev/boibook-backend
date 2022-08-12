import "dotenv/config";
import "regenerator-runtime";
import mongoose from "mongoose";
import { Odds3 } from "./controllers/sports/sportsrealtime";

try {
  mongoose.connect(process.env.DATABASE as string).then(() => {
    Odds3();
  });
} catch (error) {
  console.log(`Odds3`, error);
}
