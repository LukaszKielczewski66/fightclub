import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { createClassTemplateCtrl, listClassTemplatesCtrl, updateClassTemplateCtrl } from "../controllers/admin.classes.controller";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/templates", listClassTemplatesCtrl);
router.post("/templates", createClassTemplateCtrl);
router.patch("/templates/:id", updateClassTemplateCtrl);

export default router;
