import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import {
  getAttendanceDetailsCtrl,
  listActiveAttendanceCtrl,
  listPastAttendanceCtrl,
  updateAttendanceCtrl,
} from "../controllers/attendance.controller";

const router = Router();

router.use(requireAuth, requireRole("admin", "trainer"));

router.get("/active", listActiveAttendanceCtrl);

router.get("/past", listPastAttendanceCtrl);

router.get("/:sessionId", getAttendanceDetailsCtrl);

router.patch("/:sessionId", updateAttendanceCtrl);

export default router;
