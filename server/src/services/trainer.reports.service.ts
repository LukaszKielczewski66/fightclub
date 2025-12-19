import { Types } from "mongoose";
import { Session } from "../models/Session";
import { Attendance } from "../models/Attendance";
import { addDays, startOfWeekMonday } from "../utils/helpers";
import { SessionLean } from "../utils/types";

type DayReport = {
  date: string;
  sessionsCount: number;
  hours: number;
  reserved: number;
  present: number;
  absent: number;
  sessions: Array<{
    id: string;
    name: string;
    type: string;
    level: string;
    startAt: string;
    endAt: string;
    reserved: number;
    present: number;
    absent: number;
  }>;
};

export type TrainerWeeklyReport = {
  weekStart: string;
  weekEnd: string;
  totals: {
    sessionsCount: number;
    hours: number;
    reserved: number;
    present: number;
    absent: number;
    avgAttendanceRate: number;
  };
  days: DayReport[];
};

function hoursBetween(startAt: Date, endAt: Date) {
  const ms = endAt.getTime() - startAt.getTime();
  return Math.max(0, ms / 36e5);
}

export async function getTrainerWeeklyReportSvc(args: {
  trainerId: string;
  weekStart?: Date;
}): Promise<TrainerWeeklyReport> {
  const base = args.weekStart ? startOfWeekMonday(args.weekStart) : startOfWeekMonday(new Date());
  const from = base;
  const to = addDays(from, 7);

    const sessions = await Session.find({
    trainerId: new Types.ObjectId(args.trainerId),
    startAt: { $gte: from, $lt: to },
    })
    .select("name type level startAt endAt participants")
    .sort({ startAt: 1 })
    .lean<SessionLean[]>();

  const sessionIds = sessions.map((s) => s._id);
  const attendance = sessionIds.length
    ? await Attendance.find({ sessionId: { $in: sessionIds } })
        .select("sessionId userId status")
        .lean()
    : [];

  const bySession = new Map<string, Map<string, "present" | "absent">>();
  for (const a of attendance) {
    const sid = String(a.sessionId);
    const uid = String(a.userId);
    if (!bySession.has(sid)) bySession.set(sid, new Map());
    bySession.get(sid)!.set(uid, a.status);
  }

  const days: DayReport[] = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(from, i);
    const dd = new Date(d);
    dd.setHours(0, 0, 0, 0);
    return {
      date: dd.toISOString(),
      sessionsCount: 0,
      hours: 0,
      reserved: 0,
      present: 0,
      absent: 0,
      sessions: [],
    };
  });

  for (const s of sessions) {
    const start = new Date(s.startAt);
    const end = new Date(s.endAt);

    const day = start.getDay();
    const idx = day === 0 ? 6 : day - 1;

    const participantsIds = (s.participants ?? []).map((x: any) => String(x));
    const reserved = participantsIds.length;

    const map = bySession.get(String(s._id)) ?? new Map();
    let present = 0;
    let absent = 0;

    for (const uid of participantsIds) {
      const st = map.get(uid);
      if (st === "present") present++;
      else absent++; 
    }

    const h = hoursBetween(start, end);

    days[idx].sessionsCount += 1;
    days[idx].hours += h;
    days[idx].reserved += reserved;
    days[idx].present += present;
    days[idx].absent += absent;

    days[idx].sessions.push({
      id: String(s._id),
      name: s.name,
      type: s.type,
      level: s.level,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      reserved,
      present,
      absent,
    });
  }

  const totals = days.reduce(
    (acc, d) => {
      acc.sessionsCount += d.sessionsCount;
      acc.hours += d.hours;
      acc.reserved += d.reserved;
      acc.present += d.present;
      acc.absent += d.absent;
      return acc;
    },
    { sessionsCount: 0, hours: 0, reserved: 0, present: 0, absent: 0 }
  );

  const avgAttendanceRate = totals.reserved > 0 ? totals.present / totals.reserved : 0;

  return {
    weekStart: from.toISOString(),
    weekEnd: to.toISOString(),
    totals: {
      ...totals,
      hours: Math.round(totals.hours * 100) / 100,
      avgAttendanceRate,
    },
    days: days.map((d) => ({
      ...d,
      hours: Math.round(d.hours * 100) / 100,
    })),
  };
}
