import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { getClubSettingsCtrl, updateClubSettingsCtrl } from "../controllers/admin.settings.controller";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/", getClubSettingsCtrl);
router.put("/", updateClubSettingsCtrl);

export default router;
