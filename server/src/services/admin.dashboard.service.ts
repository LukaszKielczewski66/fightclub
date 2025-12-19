import { Types } from "mongoose";
import { User } from "../models/User";
import { Session } from "../models/Session";
import { Attendance } from "../models/Attendance";
import { addDays, startOfWeekMonday } from "../utils/helpers";
import { DashboardKpis, TopTrainer, UpcomingSession } from "../utils/types";

export async function getAdminDashboardSvc(args: { from?: Date; to?: Date }) {
  const weekStart = args.from ?? startOfWeekMonday(new Date());
  const weekEnd = args.to ?? addDays(weekStart, 7);

  const [usersTotal, usersActive, trainersTotal] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "user", active: true }),
    User.countDocuments({ role: "trainer" }),
  ]);

  const sessionsInRange = await Session.find({
    startAt: { $gte: weekStart, $lt: weekEnd },
  })
    .select("name type level trainerId startAt endAt capacity participants")
    .populate("trainerId", "name")
    .lean();

  const sessionsCount = sessionsInRange.length;
  const bookingsCount = sessionsInRange.reduce(
    (acc, s) => acc + (Array.isArray((s as any).participants) ? (s as any).participants.length : 0),
    0
  );
  const capacityTotal = sessionsInRange.reduce((acc, s) => acc + Number((s as any).capacity ?? 0), 0);
  const fillRate = capacityTotal > 0 ? Math.round((bookingsCount / capacityTotal) * 1000) / 10 : 0;

  const sessionIds = sessionsInRange.map((s: any) => new Types.ObjectId(String(s._id)));

  const attendanceDocs = sessionIds.length
    ? await Attendance.find({ sessionId: { $in: sessionIds } }).select("status").lean()
    : [];

  const attendanceMarked = attendanceDocs.length;
  const attendancePresent = attendanceDocs.filter((a: any) => a.status === "present").length;
  const attendanceAbsent = attendanceDocs.filter((a: any) => a.status === "absent").length;
  const presentRate = attendanceMarked > 0 ? Math.round((attendancePresent / attendanceMarked) * 1000) / 10 : 0;

  const upcoming = await Session.find({
    startAt: { $gte: new Date(), $lt: addDays(new Date(), 7) },
  })
    .sort({ startAt: 1 })
    .limit(8)
    .select("name type level trainerId startAt endAt capacity participants")
    .populate("trainerId", "name")
    .lean();

  const upcomingSessions: UpcomingSession[] = upcoming.map((s: any) => ({
    id: String(s._id),
    name: s.name,
    type: s.type,
    level: s.level,
    trainerName: s.trainerId?.name ?? "Trener",
    startAt: new Date(s.startAt).toISOString(),
    endAt: new Date(s.endAt).toISOString(),
    reserved: Array.isArray(s.participants) ? s.participants.length : 0,
    capacity: s.capacity,
  }));

  const since30d = addDays(new Date(), -30);
  const topAgg = await Session.aggregate([
    { $match: { startAt: { $gte: since30d, $lt: new Date() } } },
    {
      $project: {
        trainerId: 1,
        reserved: { $size: { $ifNull: ["$participants", []] } },
      },
    },
    {
      $group: {
        _id: "$trainerId",
        sessionsCount: { $sum: 1 },
        bookingsCount: { $sum: "$reserved" },
      },
    },
    { $sort: { sessionsCount: -1, bookingsCount: -1 } },
    { $limit: 5 },
  ]);

  const trainerIds = topAgg.map((x) => x._id).filter(Boolean);
  const trainers = await User.find({ _id: { $in: trainerIds } }).select("name").lean();
  const nameById = new Map(trainers.map((t: any) => [String(t._id), t.name ?? "Trener"]));

  const topTrainers: TopTrainer[] = topAgg.map((x) => ({
    trainerId: String(x._id),
    trainerName: nameById.get(String(x._id)) ?? "Trener",
    sessionsCount: x.sessionsCount ?? 0,
    bookingsCount: x.bookingsCount ?? 0,
  }));

  const kpis: DashboardKpis = {
    usersTotal,
    usersActive,
    trainersTotal,
    sessionsCount,
    bookingsCount,
    capacityTotal,
    fillRate,
    attendanceMarked,
    attendancePresent,
    attendanceAbsent,
    presentRate,
  };

  return {
    range: { from: weekStart.toISOString(), to: weekEnd.toISOString() },
    kpis,
    upcomingSessions,
    topTrainers,
  };
}
