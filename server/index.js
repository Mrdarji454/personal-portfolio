import mongoose from "mongoose";
import { createApp } from "./app.js";
import { readConfig } from "./config.js";
try {
  const config = readConfig();
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  const server = createApp(config).listen(config.port, () =>
    console.log(`Portfolio API listening on port ${config.port}`),
  );
  const shutdown = () =>
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
} catch (e) {
  console.error(
    "Startup failed:",
    e.message.replace(/mongodb(?:\+srv)?:\/\/\S+/g, "[database URI]"),
  );
  process.exitCode = 1;
}
