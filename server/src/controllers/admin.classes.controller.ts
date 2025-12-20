import { Request, Response } from "express";
import { createClassTemplateSvc, listClassTemplatesSvc, updateClassTemplateSvc } from "../services/admin.classes.service";

export async function listClassTemplatesCtrl(req: Request, res: Response) {
  try {
    const query = typeof req.query.query === "string" ? req.query.query : undefined;
    const type = typeof req.query.type === "string" ? (req.query.type as any) : undefined;

    const activeRaw = typeof req.query.active === "string" ? req.query.active : undefined;
    const active = activeRaw === "true" ? true : activeRaw === "false" ? false : undefined;

    const sort = typeof req.query.sort === "string" ? (req.query.sort as any) : undefined;

    const result = await listClassTemplatesSvc({ query, type, active, sort });
    return res.json(result);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 500).json({ message: e.message ?? "Nie udało się pobrać oferty" });
  }
}

export async function createClassTemplateCtrl(req: Request, res: Response) {
  try {
    const { name, type, level, durationMin, defaultCapacity } = req.body || {};
    const result = await createClassTemplateSvc({ name, type, level, durationMin, defaultCapacity });
    return res.status(201).json(result);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 500).json({ message: e.message ?? "Nie udało się dodać szablonu" });
  }
}

export async function updateClassTemplateCtrl(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const { name, type, level, durationMin, defaultCapacity, active } = req.body || {};
    const result = await updateClassTemplateSvc({ id, name, type, level, durationMin, defaultCapacity, active });
    return res.json(result);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 500).json({ message: e.message ?? "Nie udało się zaktualizować szablonu" });
  }
}
