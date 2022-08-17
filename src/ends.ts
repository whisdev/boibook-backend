import "dotenv/config";
import "regenerator-runtime";
import mongoose from "mongoose";
import { Ends } from "./controllers/sports/sportsrealtime";

try {
  mongoose.connect(process.env.DATABASE as string).then(() => {
    Ends();
  });
} catch (error) {
  console.log(`Ends`, error);
}
