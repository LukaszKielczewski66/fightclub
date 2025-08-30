import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.routes";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/health", healthRouter);

  app.use((req, res) => {
    res.status(404).json({ message: "Not Found" });
  });

  return app;
};
