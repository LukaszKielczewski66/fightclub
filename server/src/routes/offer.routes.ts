import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { listOfferTemplatesCtrl } from "../controllers/offer.controller";

const router = Router();

router.get("/templates", requireAuth, requireRole("trainer", "admin"), listOfferTemplatesCtrl);

export default router;
