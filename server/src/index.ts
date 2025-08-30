import mongoose from "mongoose";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const app = createApp();

mongoose
  .connect(env.MONGO_URI)
  .then(() => {
    logger.info("✅ MongoDB connected");
    app.listen(env.PORT, () =>
      logger.info(`🚀 Server running on port ${env.PORT}`)
    );
  })
  .catch((err) => {
    logger.error({ err }, "❌ MongoDB connection failed");
    process.exit(1);
  });
