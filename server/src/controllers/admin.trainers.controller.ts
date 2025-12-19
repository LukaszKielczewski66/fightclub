import { Request, Response } from "express";
import { getAdminTrainersOverviewSvc } from "../services/admin.trainers.service";
import { parseDateOrNull } from "../utils/helpers";

export async function getAdminTrainersOverviewCtrl(req: Request, res: Response) {
  try {
    const from = parseDateOrNull(req.query.from);
    const to = parseDateOrNull(req.query.to);

    const query = typeof req.query.query === "string" ? req.query.query.trim() : undefined;
    const activeRaw = typeof req.query.active === "string" ? req.query.active : undefined;
    const active = activeRaw === "true" ? true : activeRaw === "false" ? false : undefined;

    const sort = typeof req.query.sort === "string" ? req.query.sort : "week.hours:desc";

    const result = await getAdminTrainersOverviewSvc({ from: from ?? undefined, to: to ?? undefined, query, active, sort });
    return res.json(result);
  } catch (err: any) {
    return res.status(Number(err?.status ?? 500)).json({ message: err?.message ?? "Failed to fetch trainers overview" });
  }
}
