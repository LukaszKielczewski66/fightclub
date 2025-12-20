import { Request, Response } from "express";
import { getClubSettingsSvc, updateClubSettingsSvc } from "../services/admin.settings.service";

export async function getClubSettingsCtrl(_req: Request, res: Response) {
  try {
    const data = await getClubSettingsSvc();
    return res.json(data);
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    return res.status(e.status ?? 500).json({ message: e.message ?? "Nie udało się pobrać ustawień" });
  }
}

export async function updateClubSettingsCtrl(req: Request, res: Response) {
  try {
    const data = await updateClubSettingsSvc(req.body ?? {});
    return res.json(data);
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    return res.status(e.status ?? 500).json({ message: e.message ?? "Nie udało się zapisać ustawień" });
  }
}
