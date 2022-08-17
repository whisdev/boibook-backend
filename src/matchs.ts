import "dotenv/config";
import "regenerator-runtime";
import mongoose from "mongoose";
import { Matchs } from "./controllers/sports/sportsrealtime";

try {
  mongoose.connect(process.env.DATABASE as string).then(() => {
    Matchs();
  });
} catch (error) {
  console.log(`Matchs`, error);
}
