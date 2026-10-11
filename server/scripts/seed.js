import mongoose from "mongoose";
import { readConfig } from "../config.js";
import { seedContent } from "../seed-content.js";
try {
  await mongoose.connect(readConfig().mongoUri);
  await seedContent();
  console.log("Seed complete. Existing content was preserved.");
} catch (e) {
  console.error("Seed failed:", e.name);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
