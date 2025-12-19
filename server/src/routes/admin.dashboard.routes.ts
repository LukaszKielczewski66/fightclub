import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { getAdminDashboardCtrl } from "../controllers/admin.dashboard.controller";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/", getAdminDashboardCtrl);

export default router;
