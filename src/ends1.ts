import "dotenv/config";
import "regenerator-runtime";
import mongoose from "mongoose";
import { Ends1 } from "./controllers/sports/sportsrealtime";

try {
  mongoose.connect(process.env.DATABASE as string).then(() => {
    Ends1();
  });
} catch (error) {
  console.log(`Ends1`, error);
}
