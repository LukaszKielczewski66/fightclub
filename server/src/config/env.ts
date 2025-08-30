import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 8080,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/fightclub",
  JWT_SECRET: process.env.JWT_SECRET || "jw-token",
};
