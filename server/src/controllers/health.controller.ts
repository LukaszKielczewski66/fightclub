import { Request, Response } from "express";
import mongoose from "mongoose";

export const healthCheck = (req: Request, res: Response) => {
  const dbStates: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({
    service: "fightclub-api",
    status: "ok",
    uptimeSec: Math.round(process.uptime()),
    db: dbStates[mongoose.connection.readyState] ?? "unknown",
    time: new Date().toISOString(),
  });
};
