import { Request, Response } from "express";
import { getAdminWeeklyClubReportSvc } from "../services/admin.reports.service";
import { parseDateOrNull } from "../utils/helpers";

export async function getAdminWeeklyClubReportCtrl(req: Request, res: Response) {
  try {
    const weekStartRaw = typeof req.query.weekStart === "string" ? req.query.weekStart : undefined;
    const ws = weekStartRaw ? parseDateOrNull(weekStartRaw) : new Date();
    if (!ws) return res.status(400).json({ message: "Nieprawidłowe weekStart" });

    const data = await getAdminWeeklyClubReportSvc(ws);
    return res.json(data);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 500).json({ message: e.message ?? "Nie udało się pobrać raportu" });
  }
}
