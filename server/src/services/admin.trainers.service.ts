import { Types } from "mongoose";
import { User } from "../models/User";
import { Session } from "../models/Session";
import { addDays, startOfWeekMonday } from "../utils/helpers";
import { TrainerOverviewItem } from "../utils/types";

function rxOrNull(q?: string) {
  if (!q) return null;
  const t = q.trim();
  if (!t) return null;
  return new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

export async function getAdminTrainersOverviewSvc(args: {
  from?: Date;
  to?: Date;
  query?: string;
  active?: boolean;
  sort?: string;
}) {
  const weekStart = args.from ?? startOfWeekMonday(new Date());
  const weekEnd = args.to ?? addDays(weekStart, 7);

  const filter: any = { role: "trainer" };
  if (typeof args.active === "boolean") filter.active = args.active;

  const rx = rxOrNull(args.query);
  if (rx) filter.$or = [{ name: rx }, { email: rx }];

  const trainers = await User.find(filter)
    .select("email name active specializations levelsTaught maxWeeklyHours")
    .lean();

  const trainerIds = trainers.map((t: any) => new Types.ObjectId(String(t._id)));

  async function agg(from: Date, to: Date) {
    if (!trainerIds.length) return new Map<string, any>();

    const rows = await Session.aggregate([
      { $match: { trainerId: { $in: trainerIds }, startAt: { $gte: from, $lt: to } } },
      {
        $project: {
          trainerId: 1,
          capacity: 1,
          reserved: { $size: { $ifNull: ["$participants", []] } },
          hours: { $divide: [{ $subtract: ["$endAt", "$startAt"] }, 3600000] },
        },
      },
      {
        $group: {
          _id: "$trainerId",
          sessionsCount: { $sum: 1 },
          hours: { $sum: "$hours" },
          bookings: { $sum: "$reserved" },
          capacity: { $sum: "$capacity" },
        },
      },
    ]);

    const map = new Map<string, any>();
    for (const r of rows) map.set(String(r._id), r);
    return map;
  }

  const weekMap = await agg(weekStart, weekEnd);
  const since30 = addDays(new Date(), -30);
  const last30Map = await agg(since30, new Date());

  const items: TrainerOverviewItem[] = trainers.map((t: any) => {
    const id = String(t._id);

    const w = weekMap.get(id) ?? { sessionsCount: 0, hours: 0, bookings: 0, capacity: 0 };
    const l = last30Map.get(id) ?? { sessionsCount: 0, hours: 0, bookings: 0, capacity: 0 };

    const weekFill = w.capacity > 0 ? Math.round((w.bookings / w.capacity) * 1000) / 10 : 0;
    const lastFill = l.capacity > 0 ? Math.round((l.bookings / l.capacity) * 1000) / 10 : 0;

    const max = (t.maxWeeklyHours ?? null) as number | null;
    const hoursRounded = Math.round((Number(w.hours) || 0) * 10) / 10;

    return {
      id,
      name: t.name,
      email: t.email,
      active: !!t.active,
      specializations: (t.specializations ?? []) as string[],
      levelsTaught: (t.levelsTaught ?? []) as string[],
      maxWeeklyHours: max,

      week: {
        sessionsCount: Number(w.sessionsCount) || 0,
        hours: hoursRounded,
        bookings: Number(w.bookings) || 0,
        capacity: Number(w.capacity) || 0,
        fillRate: weekFill,
        overLimit: max != null ? hoursRounded > max : false,
      },

      last30: {
        sessionsCount: Number(l.sessionsCount) || 0,
        bookings: Number(l.bookings) || 0,
        capacity: Number(l.capacity) || 0,
        fillRate: lastFill,
      },
    };
  });

  const sort = args.sort ?? "week.hours:desc";
  const [field, dirRaw] = sort.split(":");
  const dir = dirRaw === "asc" ? 1 : -1;

  const getVal = (it: any) => {
    if (field === "name") return it.name ?? "";
    if (field === "week.hours") return it.week.hours ?? 0;
    if (field === "week.sessionsCount") return it.week.sessionsCount ?? 0;
    if (field === "week.fillRate") return it.week.fillRate ?? 0;
    if (field === "last30.fillRate") return it.last30.fillRate ?? 0;
    return 0;
  };

  items.sort((a, b) => {
    const av = getVal(a);
    const bv = getVal(b);
    if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
    return (Number(av) - Number(bv)) * dir;
  });

  const trainersTotal = items.length;
  const trainersActive = items.filter((x) => x.active).length;
  const sessionsThisWeek = items.reduce((acc, x) => acc + x.week.sessionsCount, 0);
  const overLimitCount = items.filter((x) => x.week.overLimit).length;

  const cap = items.reduce((acc, x) => acc + x.week.capacity, 0);
  const book = items.reduce((acc, x) => acc + x.week.bookings, 0);
  const avgFillRate = cap > 0 ? Math.round((book / cap) * 1000) / 10 : 0;

  return {
    range: { from: weekStart.toISOString(), to: weekEnd.toISOString() },
    kpis: { trainersTotal, trainersActive, sessionsThisWeek, avgFillRate, overLimitCount },
    items,
  };
}
