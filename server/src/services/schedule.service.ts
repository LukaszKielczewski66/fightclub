import mongoose from "mongoose";
import { Session } from "../models/Session";
import { User } from "../models/User";
import { CreateSessionInput } from "@/utils/types";
import { addDays, isIntInRange, parseDateOrNull, startOfWeekMonday } from "../utils/helpers";


type HttpErr = Error & { status?: number };

function httpError(message: string, status: number): HttpErr {
  const err: HttpErr = new Error(message);
  err.status = status;
  return err;
}

export async function createScheduleSessionSvc(
  input: CreateSessionInput,
  authUser: { id: string; role: string }
) {
  const {
    name,
    type,
    level,
    capacity,
    weekStart,
    weekday,
    startHour,
    startMinute = 0,
    endHour,
    endMinute = 0,
    trainerId,
  } = input;


  if (!name || !type || !level) throw new Error("Brak wymaganych pól: name/type/level");
  if (!["BJJ", "MMA", "Cross"].includes(type)) throw new Error("Nieprawidłowy type");
  if (!["beginner", "intermediate", "advanced"].includes(level)) throw new Error("Nieprawidłowy level");
  if (!Number.isFinite(capacity) || capacity < 1 || capacity > 200) throw new Error("Nieprawidłowa capacity (1..200)");

  if (!isIntInRange(weekday, 1, 7)) throw new Error("weekday jest wymagane (1..7)");
  if (!isIntInRange(startHour, 0, 23) || !isIntInRange(endHour, 0, 23)) {
    throw new Error("startHour/endHour muszą być w zakresie 0..23");
  }
  if (!isIntInRange(startMinute, 0, 59) || !isIntInRange(endMinute, 0, 59)) {
    throw new Error("startMinute/endMinute muszą być w zakresie 0..59");
  }

  let finalTrainerId = authUser.id;

  if (authUser.role === "trainer") {
    if (trainerId && trainerId !== authUser.id) throw new Error("Trener nie może tworzyć zajęć dla innego trenera");
    finalTrainerId = authUser.id;
  } else if (authUser.role === "admin") {
    if (trainerId) finalTrainerId = trainerId;
  } else {
    throw new Error("Brak uprawnień");
  }

  if (!mongoose.isValidObjectId(finalTrainerId)) throw new Error("Nieprawidłowy trainerId");

  const trainer = await User.findById(finalTrainerId).select("name role active");
  if (!trainer) throw new Error("Trener nie istnieje");
  if (!trainer.active) throw new Error("Konto trenera jest wyłączone");
  if (trainer.role !== "trainer" && trainer.role !== "admin") throw new Error("Wybrany użytkownik nie jest trenerem");

  const ws = weekStart ? parseDateOrNull(weekStart) : new Date();
  if (!ws) throw new Error("Nieprawidłowe weekStart");

  const monday = startOfWeekMonday(ws);
  const baseDay = addDays(monday, (weekday as number) - 1);

  const startAt = new Date(baseDay);
  startAt.setHours(startHour, startMinute, 0, 0);

  const endAt = new Date(baseDay);
  endAt.setHours(endHour, endMinute, 0, 0);

  if (endAt <= startAt) throw new Error("endAt musi być później niż startAt");

  const overlapAny = await Session.findOne({
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  }).select("_id");

  if (overlapAny) throw new Error("Kolizja: w tym czasie są już inne zajęcia");

  const overlapTrainer = await Session.findOne({
    trainerId: finalTrainerId,
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  }).select("_id");

  if (overlapTrainer) throw new Error("Kolizja: trener ma już zajęcia w tym czasie");

  const created = await Session.create({
    name,
    type,
    level,
    capacity,
    trainerId: finalTrainerId,
    startAt,
    endAt,
    participants: [],
  });

  return {
    id: created.id,
    name: created.name,
    type: created.type,
    level: created.level,
    trainerName: trainer.name,
    capacity: created.capacity,
    startAt: (created.startAt as Date).toISOString(),
    endAt: (created.endAt as Date).toISOString(),
    reserved: 0,
    participantsIds: [],
  };
}



export async function bookSessionSvc(args: { sessionId: string; userId: string }) {
  const { sessionId, userId } = args;

  if (!mongoose.isValidObjectId(sessionId)) {
    const err = new Error("Nieprawidłowe id zajęć");
    (err as any).status = 400;
    throw err;
  }

  const updated = await Session.findOneAndUpdate(
    {
      _id: sessionId,
      participants: { $ne: userId },
      $expr: { $lt: [{ $size: "$participants" }, "$capacity"] },
    },
    { $addToSet: { participants: userId } },
    { new: true }
  )
    .select("name type level trainerId startAt endAt capacity participants")
    .populate("trainerId", "name")
    .lean();

  if (!updated) {
    const s = await Session.findById(sessionId).select("capacity participants").lean();

    if (!s) {
      const err = new Error("Zajęcia nie istnieją");
      (err as any).status = 404;
      throw err;
    }

    const already =
      Array.isArray((s as any).participants) &&
      (s as any).participants.some((p: any) => String(p) === userId);

    if (already) {
      const err = new Error("Jesteś już zapisany na te zajęcia");
      (err as any).status = 409;
      throw err;
    }

    const reserved = Array.isArray((s as any).participants) ? (s as any).participants.length : 0;
    if (reserved >= (s as any).capacity) {
      const err = new Error("Brak miejsc na te zajęcia");
      (err as any).status = 409;
      throw err;
    }

    const err = new Error("Nie można zapisać na zajęcia");
    (err as any).status = 409;
    throw err;
  }

  const u: any = updated;

  return {
    id: String(u._id),
    name: u.name,
    type: u.type,
    level: u.level,
    trainerName: u.trainerId?.name ?? "Trainer",
    capacity: u.capacity,
    startAt: new Date(u.startAt).toISOString(),
    endAt: new Date(u.endAt).toISOString(),
    reserved: Array.isArray(u.participants) ? u.participants.length : 0,
    participantsIds: (u.participants ?? []).map((id: any) => String(id)),
  };
}

export async function listMyBookingsSvc(args: { userId: string; from?: Date; to?: Date }) {
  const { userId, from, to } = args;

  const filter: any = {
    participants: userId,
    startAt: { $gte: from ?? new Date() },
  };

  if (to) {
    filter.startAt = { ...(filter.startAt ?? {}), $lt: to };
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

  return { items };
}

export async function unbookSessionSvc(args: { sessionId: string; userId: string }) {
  const { sessionId, userId } = args;

  if (!mongoose.isValidObjectId(sessionId)) {
    throw httpError("Nieprawidłowe id zajęć", 400);
  }

  const updated = await Session.findOneAndUpdate(
    { _id: sessionId, participants: userId },
    { $pull: { participants: userId } },
    { new: true }
  )
    .select("name type level trainerId startAt endAt capacity participants")
    .populate("trainerId", "name")
    .lean();

  if (!updated) {
    const exists = await Session.findById(sessionId).select("_id").lean();
    if (!exists) throw httpError("Zajęcia nie istnieją", 404);
    throw httpError("Nie jesteś zapisany na te zajęcia", 409);
  }

  const u: any = updated;

  return {
    id: String(u._id),
    name: u.name,
    type: u.type,
    level: u.level,
    trainerName: u.trainerId?.name ?? "Trainer",
    capacity: u.capacity,
    startAt: new Date(u.startAt).toISOString(),
    endAt: new Date(u.endAt).toISOString(),
    reserved: Array.isArray(u.participants) ? u.participants.length : 0,
    participantsIds: (u.participants ?? []).map((id: any) => String(id)),
  };
}