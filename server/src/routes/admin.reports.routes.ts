import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { getAdminWeeklyClubReportCtrl } from "../controllers/admin.reports.controller";

const router = Router();

router.use(requireAuth, requireRole("admin"));
router.get("/weekly", getAdminWeeklyClubReportCtrl);

export default router;
