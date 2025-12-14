import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { listScheduleSessionsCtrl, createScheduleSessionCtrl, listMySessionsCtrl, bookSessionCtrl } from "../controllers/schedule.controller";
import { listMyBookingsCtrl, unbookSessionCtrl } from "../controllers/schedule.controller";


const router = Router();

router.get("/sessions", requireAuth, listScheduleSessionsCtrl);
router.post("/sessions", requireAuth, requireRole("admin", "trainer"), createScheduleSessionCtrl);
router.get("/my-sessions", requireAuth, requireRole("admin", "trainer"), listMySessionsCtrl);
router.post(
  "/sessions/:id/book",
  requireAuth,
  requireRole("user"),
  bookSessionCtrl
);
router.get("/my-bookings", requireAuth, requireRole("user"), listMyBookingsCtrl);
router.delete("/sessions/:id/book", requireAuth, requireRole("user"), unbookSessionCtrl);


export default router;
