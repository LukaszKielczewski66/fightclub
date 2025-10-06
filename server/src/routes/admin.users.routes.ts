import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { getUsersListCtrl, getUserByIdCtrl } from "../controllers/admin.users.controller"

const router = Router();


router.use(requireAuth, requireRole("admin"));

router.get("/", getUsersListCtrl);

router.get("/:id", getUserByIdCtrl);

export default router;
