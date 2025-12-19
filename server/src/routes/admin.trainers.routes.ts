import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { getAdminTrainersOverviewCtrl } from "../controllers/admin.trainers.controller";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/overview", getAdminTrainersOverviewCtrl);

export default router;
