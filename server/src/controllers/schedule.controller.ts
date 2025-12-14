import { Request, Response } from "express";
import { Session } from "../models/Session";
import { createScheduleSessionSvc } from "../services/schedule.service";
import { bookSessionSvc } from "../services/schedule.service";
import { listMyBookingsSvc, unbookSessionSvc } from "../services/schedule.service";


function parseDateOrNull(v: unknown) {
  if (typeof v !== "string") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function listScheduleSessionsCtrl(req: Request, res: Response) {
  const from = parseDateOrNull(req.query.from);
  const to = parseDateOrNull(req.query.to);

  if (!from || !to) {
    return res
      .status(400)
      .json({ message: "Missing or invalid 'from'/'to' query params (ISO dates)." });
  }

  const sessions = await Session.find({
    startAt: { $gte: from, $lt: to },
  })
    .sort({ startAt: 1 })
    .select("name type level trainerId startAt endAt capacity participants")
    .populate("trainerId", "name")
    .lean();

  const items = sessions.map((s: any) => ({
    id: String(s._id),
    name: s.name,
    type: s.type,
    level: s.level,
    trainerName: s.trainerId?.name ?? "Trainer",
    capacity: s.capacity,
    startAt: new Date(s.startAt).toISOString(),
    endAt: new Date(s.endAt).toISOString(),
    reserved: Array.isArray(s.participants) ? s.participants.length : 0,
    participantsIds: (s.participants ?? []).map((id: any) => String(id)),
  }));

  return res.json({ items });
}


export async function createScheduleSessionCtrl(req: Request, res: Response) {
  try {
    const result = await createScheduleSessionSvc(req.body, req.user!);
    return res.status(201).json(result);
  } catch (err: any) {
    const msg = err?.message ?? "Nie udało się utworzyć zajęć";
    const status = msg.startsWith("Kolizja") ? 409 : 400;
    return res.status(status).json({ message: msg });
  }
}

export async function listMySessionsCtrl(req: Request, res: Response) {
  const from = parseDateOrNull(req.query.from);
  const to = parseDateOrNull(req.query.to);

  const trainerId =
    req.user?.role === "admin" && typeof req.query.trainerId === "string"
      ? req.query.trainerId
      : req.user!.id;

  const filter: any = { trainerId };

  if (from && to) {
    filter.startAt = { $gte: from, $lt: to };
  } else {
    filter.startAt = { $gte: new Date() };
  }

  const sessions = await Session.find(filter)
    .sort({ startAt: 1 })
    .select("name type level trainerId startAt endAt capacity participants")
    .populate("trainerId", "name")
    .lean();

  const items = sessions.map((s: any) => ({
    id: String(s._id),
    name: s.name,
    type: s.type,
    level: s.level,
    trainerName: s.trainerId?.name ?? "Trainer",
    capacity: s.capacity,
    startAt: new Date(s.startAt).toISOString(),
    endAt: new Date(s.endAt).toISOString(),
    reserved: Array.isArray(s.participants) ? s.participants.length : 0,
    participantsIds: (s.participants ?? []).map((id: any) => String(id)),
  }));

  return res.json({ items });
}


export async function bookSessionCtrl(req: Request, res: Response) {
  try {
    const result = await bookSessionSvc({
      sessionId: req.params.id,
      userId: req.user!.id,
    });
    return res.json(result);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 400).json({ message: e.message ?? "Nie udało się zapisać" });
  }
}



export async function listMyBookingsCtrl(req: Request, res: Response) {
  try {
    const from = parseDateOrNull(req.query.from);
    const to = parseDateOrNull(req.query.to);

    const result = await listMyBookingsSvc({
      userId: req.user!.id,
      from: from ?? undefined,
      to: to ?? undefined,
    });

    return res.json(result);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 400).json({ message: e.message ?? "Nie udało się pobrać zapisów" });
  }
}

export async function unbookSessionCtrl(req: Request, res: Response) {
  try {
    const result = await unbookSessionSvc({
      sessionId: req.params.id,
      userId: req.user!.id,
    });
    return res.json(result);
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return res.status(e.status ?? 400).json({ message: e.message ?? "Nie udało się wypisać" });
  }
}



