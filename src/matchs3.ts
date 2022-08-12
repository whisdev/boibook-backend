import "dotenv/config";
import "regenerator-runtime";
import mongoose from "mongoose";
import { Matchs3 } from "./controllers/sports/sportsrealtime";

try {
  mongoose.connect(process.env.DATABASE as string).then(() => {
    Matchs3();
  });
} catch (error) {
  console.log(`Matchs3`, error);
}
