import { Request, Response } from "express";
import { getAdminDashboardSvc } from "../services/admin.dashboard.service"

function parseDateOrNull(v: unknown) {
  if (typeof v !== "string") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function getAdminDashboardCtrl(req: Request, res: Response) {
  try {
    const from = parseDateOrNull(req.query.from);
    const to = parseDateOrNull(req.query.to);

    const result = await getAdminDashboardSvc({ from: from ?? undefined, to: to ?? undefined });
    return res.json(result);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 400).json({ message: e.message ?? "Nie udało się pobrać dashboardu" });
  }
}
