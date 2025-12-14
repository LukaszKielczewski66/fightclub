import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { getMyProfileCtrl, updateMyProfileCtrl } from "../controllers/user.profile.controller";

const router = Router();

router.get("/me", requireAuth, getMyProfileCtrl);
router.patch("/me", requireAuth, updateMyProfileCtrl);

export default router;
