import { Request, Response } from "express";
import { getMyProfileSvc, updateMyProfileSvc } from "../services/user.profile.service";

export async function getMyProfileCtrl(req: Request, res: Response) {
  try {
    const result = await getMyProfileSvc(req.user!.id);
    return res.json({ user: result });
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 400).json({ message: e.message ?? "Nie udało się pobrać profilu" });
  }
}

export async function updateMyProfileCtrl(req: Request, res: Response) {
  try {
    const result = await updateMyProfileSvc(req.user!.id, req.body ?? {});
    return res.json({ user: result });
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 400).json({ message: e.message ?? "Nie udało się zapisać profilu" });
  }
}
