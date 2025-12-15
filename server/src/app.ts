import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes";
import adminUsersRouter from "./routes/admin.users.routes";
import scheduleRouter from "./routes/schedule.routes";
import usersRouter from "./routes/users.routes";
import attendanceRouter from "./routes/attendance.routes";


export const createApp = () => {
  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: false }));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => res.json({ service: "fightclub-api", status: "ok", time: new Date().toISOString() }));

  app.use("/api/auth", authRouter);

  // ADMIN 
  app.use("/api/admin/users", adminUsersRouter);
  
  // SCHEDULE
  app.use("/api/schedule", scheduleRouter);

  // USER
  app.use("/api/users", usersRouter);

  // ATTENDANCE
   app.use("/api/trainer/attendance", attendanceRouter);


  app.use((_req, res) => res.status(404).json({ message: "Not Found" }));
  return app;
};
