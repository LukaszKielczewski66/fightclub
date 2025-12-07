import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { getUsersListCtrl, getUserByIdCtrl, createUserCtrl } from "../controllers/admin.users.controller"

const router = Router();


router.use(requireAuth, requireRole("admin"));

router.get("/", getUsersListCtrl);
router.get("/:id", getUserByIdCtrl);
router.post("/", createUserCtrl);

export default router;
