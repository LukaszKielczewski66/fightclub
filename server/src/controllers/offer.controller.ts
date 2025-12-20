import { Request, Response } from "express";
import { listClassTemplatesSvc } from "../services/admin.classes.service";

export async function listOfferTemplatesCtrl(_req: Request, res: Response) {
  try {
    const result = await listClassTemplatesSvc({ active: true, sort: "name:asc" });
    return res.json(result);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 500).json({ message: e.message ?? "Nie udało się pobrać oferty" });
  }
}
