import { Request, Response } from "express";
import {
  getSessionAttendanceDetails,
  listActiveTrainerSessionsWithAttendance,
  listPastTrainerSessions,
  updateSessionAttendance,
} from "../services/attendance.service";

export async function listActiveAttendanceCtrl(req: Request, res: Response) {
  try {
    const trainerId = req.user!.role === "admin" && typeof req.query.trainerId === "string"
      ? req.query.trainerId
      : req.user!.id;

    const result = await listActiveTrainerSessionsWithAttendance(trainerId);
    return res.json(result);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 400).json({ message: e.message ?? "Nie udało się pobrać aktywnych zajęć" });
  }
}

export async function listPastAttendanceCtrl(req: Request, res: Response) {
  try {
    const trainerId = req.user!.role === "admin" && typeof req.query.trainerId === "string"
      ? req.query.trainerId
      : req.user!.id;

    const limitRaw = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 50;
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;

    const result = await listPastTrainerSessions(trainerId, limit);
    return res.json(result);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 400).json({ message: e.message ?? "Nie udało się pobrać historii zajęć" });
  }
}

export async function getAttendanceDetailsCtrl(req: Request, res: Response) {
  try {
    const result = await getSessionAttendanceDetails(req.params.sessionId, req.user!);
    return res.json(result);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 400).json({ message: e.message ?? "Nie udało się pobrać szczegółów" });
  }
}

export async function updateAttendanceCtrl(req: Request, res: Response) {
  try {
    const body = req.body as unknown;
    const updates = Array.isArray((body as any)?.updates) ? (body as any).updates : null;

    if (!updates) {
      return res.status(400).json({ message: "Brak pola updates" });
    }

    const normalized = updates
      .filter((u: any) => typeof u?.userId === "string" && (u?.status === "present" || u?.status === "absent"))
      .map((u: any) => ({ userId: u.userId, status: u.status }));

    const result = await updateSessionAttendance(req.params.sessionId, req.user!, normalized);
    return res.json(result);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 400).json({ message: e.message ?? "Nie udało się zapisać obecności" });
  }
}
