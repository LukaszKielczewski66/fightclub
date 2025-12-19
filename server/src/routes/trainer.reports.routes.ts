import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { getTrainerWeeklyReportCtrl } from "../controllers/trainer.reports.controller";

const router = Router();

router.get("/weekly", requireAuth, requireRole("trainer", "admin"), getTrainerWeeklyReportCtrl);

export default router;
