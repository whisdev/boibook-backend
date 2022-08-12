import "dotenv/config";
import "regenerator-runtime";
import mongoose from "mongoose";
import { Ends2 } from "./controllers/sports/sportsrealtime";

try {
  mongoose.connect(process.env.DATABASE as string).then(() => {
    Ends2();
  });
} catch (error) {
  console.log(`Ends2`, error);
}
