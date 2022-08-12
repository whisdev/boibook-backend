import "dotenv/config";
import "regenerator-runtime";
import mongoose from "mongoose";
import { Ends3 } from "./controllers/sports/sportsrealtime";

try {
  mongoose.connect(process.env.DATABASE as string).then(() => {
    Ends3();
  });
} catch (error) {
  console.log(`Ends3`, error);
}
