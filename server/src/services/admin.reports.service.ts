import { Types } from "mongoose";
import { Session } from "../models/Session";
import { Attendance } from "../models/Attendance";
import { addDays, startOfWeekMonday } from "../utils/helpers";
import { DayRow, TypeRow } from "../utils/types";

function hoursBetween(startAt: Date, endAt: Date) {
  const ms = endAt.getTime() - startAt.getTime();
  return Math.max(0, ms / 36e5);
}

function pctSafe(num: number, den: number) {
  if (den <= 0) return 0;
  return Math.round((num / den) * 1000) / 10;
}

export async function getAdminWeeklyClubReportSvc(weekStart: Date) {
  const monday = startOfWeekMonday(weekStart);
  const weekEnd = addDays(monday, 7);

  const sessions = await Session.find({
    startAt: { $gte: monday, $lt: weekEnd },
  })
    .select("name type level startAt endAt capacity participants trainerId")
    .populate("trainerId", "name")
    .lean();

  const sessionIds = sessions.map((s: any) => new Types.ObjectId(String(s._id)));

  const attendanceDocs = sessionIds.length
    ? await Attendance.find({ sessionId: { $in: sessionIds } })
        .select("sessionId status")
        .lean()
    : [];

  const presentBySession = new Map<string, number>();
  const absentBySession = new Map<string, number>();

  for (const a of attendanceDocs as any[]) {
    const sid = String(a.sessionId);
    if (a.status === "present") presentBySession.set(sid, (presentBySession.get(sid) ?? 0) + 1);
    if (a.status === "absent") absentBySession.set(sid, (absentBySession.get(sid) ?? 0) + 1);
  }

  const days: DayRow[] = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(monday, i);
    return {
      date: d.toISOString(),
      sessionsCount: 0,
      hours: 0,
      reserved: 0,
      capacity: 0,
      fillRate: 0,
      present: 0,
      absent: 0,
    };
  });

  const typeMap = new Map<string, Omit<TypeRow, "type" | "fillRate"> & { type: string; fillRate: number }>();

  const sessionsComputed = sessions.map((s: any) => {
    const startAt = new Date(s.startAt);
    const endAt = new Date(s.endAt);
    const durH = hoursBetween(startAt, endAt);

    const reserved = Array.isArray(s.participants) ? s.participants.length : 0;
    const capacity = Number(s.capacity ?? 0);

    const present = presentBySession.get(String(s._id)) ?? 0;
    const absent = absentBySession.get(String(s._id)) ?? 0;

    const fillRate = pctSafe(reserved, capacity);

    return {
      id: String(s._id),
      name: s.name,
      type: s.type,
      level: s.level,
      trainerName: s.trainerId?.name ?? "Trainer",
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      hours: Math.round(durH * 10) / 10,
      reserved,
      capacity,
      fillRate,
      present,
      absent,
    };
  });

  for (const s of sessionsComputed) {
    const d = new Date(s.startAt);
    const day = d.getDay();
    const idx = day === 0 ? 6 : day - 1;

    const row = days[idx];
    row.sessionsCount += 1;
    row.hours += s.hours;
    row.reserved += s.reserved;
    row.capacity += s.capacity;
    row.present += s.present;
    row.absent += s.absent;

    const key = String(s.type);
    if (!typeMap.has(key)) {
      typeMap.set(key, {
        type: key,
        sessionsCount: 0,
        hours: 0,
        reserved: 0,
        capacity: 0,
        present: 0,
        absent: 0,
        fillRate: 0,
      });
    }
    const tr = typeMap.get(key)!;
    tr.sessionsCount += 1;
    tr.hours += s.hours;
    tr.reserved += s.reserved;
    tr.capacity += s.capacity;
    tr.present += s.present;
    tr.absent += s.absent;
  }

  for (const d of days) {
    d.hours = Math.round(d.hours * 10) / 10;
    d.fillRate = pctSafe(d.reserved, d.capacity);
  }

  const byType: TypeRow[] = Array.from(typeMap.values())
    .map((t) => ({
      ...t,
      hours: Math.round(t.hours * 10) / 10,
      fillRate: pctSafe(t.reserved, t.capacity),
    }))
    .sort((a, b) => b.sessionsCount - a.sessionsCount);

  const totals = {
    sessionsCount: sessionsComputed.length,
    hours: Math.round(days.reduce((a, x) => a + x.hours, 0) * 10) / 10,
    reserved: sessionsComputed.reduce((a, x) => a + x.reserved, 0),
    capacity: sessionsComputed.reduce((a, x) => a + x.capacity, 0),
    fillRate: pctSafe(
      sessionsComputed.reduce((a, x) => a + x.reserved, 0),
      sessionsComputed.reduce((a, x) => a + x.capacity, 0)
    ),
    present: sessionsComputed.reduce((a, x) => a + x.present, 0),
    absent: sessionsComputed.reduce((a, x) => a + x.absent, 0),
    attendanceRate: pctSafe(
      sessionsComputed.reduce((a, x) => a + x.present, 0),
      sessionsComputed.reduce((a, x) => a + x.present + x.absent, 0)
    ),
  };

  const topBest = [...sessionsComputed]
    .sort((a, b) => b.fillRate - a.fillRate)
    .slice(0, 5);

  const topWorst = [...sessionsComputed]
    .sort((a, b) => a.fillRate - b.fillRate)
    .slice(0, 5);

  return {
    weekStart: monday.toISOString(),
    weekEnd: weekEnd.toISOString(),
    totals,
    days,
    byType,
    topBest,
    topWorst,
  };
}
