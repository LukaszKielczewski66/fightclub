import mongoose from "mongoose";
import { Session } from "../models/Session";
import { User } from "../models/User";

export type CreateSessionInput = {
  name: string;
  type: "BJJ" | "MMA" | "Cross";
  level: "beginner" | "intermediate" | "advanced";
  capacity: number;

  weekStart?: string;
  weekday?: number;
  startHour: number;
  startMinute?: number;
  endHour: number;
  endMinute?: number;
  trainerId?: string;
};

function parseDateOrNull(v: unknown) {
  if (typeof v !== "string") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfWeekMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isIntInRange(v: unknown, min: number, max: number) {
  return Number.isInteger(v) && typeof v === "number" && v >= min && v <= max;
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

  const overlap = await Session.findOne({
    trainerId: finalTrainerId,
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  }).select("_id");

  if (overlap) throw new Error("Kolizja: trener ma już zajęcia w tym czasie");

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
