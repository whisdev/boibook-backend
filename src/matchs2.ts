import "dotenv/config";
import "regenerator-runtime";
import mongoose from "mongoose";
import { Matchs2 } from "./controllers/sports/sportsrealtime";

try {
  mongoose.connect(process.env.DATABASE as string).then(() => {
    Matchs2();
  });
} catch (error) {
  console.log(`Matchs2`, error);
}
