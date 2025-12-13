import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { listScheduleSessionsCtrl, createScheduleSessionCtrl } from "../controllers/schedule.controller";

const router = Router();

router.get("/sessions", requireAuth, listScheduleSessionsCtrl);
router.post("/sessions", requireAuth, requireRole("admin", "trainer"), createScheduleSessionCtrl);

export default router;
