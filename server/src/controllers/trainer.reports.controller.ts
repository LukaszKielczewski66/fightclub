import { Request, Response } from "express";
import { parseDateOrNull } from "../utils/helpers";
import { getTrainerWeeklyReportSvc } from "../services/trainer.reports.service";

export async function getTrainerWeeklyReportCtrl(req: Request, res: Response) {
  try {
    const weekStart = parseDateOrNull(req.query.weekStart);
    const trainerId = req.user!.id;

    const result = await getTrainerWeeklyReportSvc({
      trainerId,
      weekStart: weekStart ?? undefined,
    });

    return res.json(result);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 400).json({ message: e.message ?? "Nie udało się pobrać raportu" });
  }
}
