import "dotenv/config";
import "regenerator-runtime";
import mongoose from "mongoose";
import { Matchs1 } from "./controllers/sports/sportsrealtime";

try {
  mongoose.connect(process.env.DATABASE as string).then(() => {
    Matchs1();
  });
} catch (error) {
  console.log(`Matchs1`, error);
}
