import { Types } from "mongoose";
import { Session } from "../models/Session";
import { Attendance, AttendanceStatus } from "../models/Attendance";
import { toDateOrThrow } from "../utils/helpers";

function toObjectId(id: string) {
  if (!Types.ObjectId.isValid(id)) return null;
  return new Types.ObjectId(id);
}

function isNowWithin(startAt: Date, endAt: Date, now = new Date()) {
  return startAt.getTime() <= now.getTime() && now.getTime() < endAt.getTime();
}

type SessionSummary = {
  id: string;
  name: string;
  type: string;
  level: string;
  startAt: string;
  endAt: string;
};

type ParticipantAttendance = {
  id: string;
  name: string;
  status: AttendanceStatus;
};

function mapSessionSummary(s: any): SessionSummary {
  return {
    id: String(s._id),
    name: s.name,
    type: s.type,
    level: s.level,
    startAt: new Date(s.startAt).toISOString(),
    endAt: new Date(s.endAt).toISOString(),
  };
}

export async function listActiveTrainerSessionsWithAttendance(trainerId: string) {
  const now = new Date();

  const sessions = await Session.find({
    trainerId,
    startAt: { $lte: now },
    endAt: { $gt: now },
  })
    .sort({ startAt: 1 })
    .select("name type level startAt endAt participants trainerId")
    .populate("participants", "name")
    .lean();

  const sessionIds = sessions.map((s: any) => String(s._id));
  const attendanceDocs = await Attendance.find({
    sessionId: { $in: sessionIds.map((id) => new Types.ObjectId(id)) },
  })
    .select("sessionId userId status")
    .lean();

  const attendanceMap = new Map<string, AttendanceStatus>();
  for (const a of attendanceDocs) {
    attendanceMap.set(`${String(a.sessionId)}:${String(a.userId)}`, a.status as AttendanceStatus);
  }

  const items = sessions.map((s: any) => {
    const participants: ParticipantAttendance[] = (s.participants ?? []).map((p: any) => {
      const key = `${String(s._id)}:${String(p._id)}`;
      return {
        id: String(p._id),
        name: p.name ?? "Użytkownik",
        status: attendanceMap.get(key) ?? "absent",
      };
    });

    return {
      session: mapSessionSummary(s),
      canEdit: true,
      participants,
    };
  });

  return { items };
}

export async function listPastTrainerSessions(trainerId: string, limit = 50) {
  const now = new Date();

  const sessions = await Session.find({
    trainerId,
    endAt: { $lte: now },
  })
    .sort({ startAt: -1 })
    .limit(limit)
    .select("name type level startAt endAt")
    .lean();

  return { items: sessions.map(mapSessionSummary) };
}

export async function getSessionAttendanceDetails(sessionId: string, requester: { id: string; role: "admin" | "trainer" | "user" }) {
  const sid = toObjectId(sessionId);
  if (!sid) {
    const err = new Error("Nieprawidłowe sessionId");
    (err as any).status = 400;
    throw err;
  }

  const session = await Session.findById(sid)
    .select("name type level startAt endAt participants trainerId")
    .populate("participants", "name")
    .lean();

  if (!session) {
    const err = new Error("Zajęcia nie istnieją");
    (err as any).status = 404;
    throw err;
  }

  if (requester.role !== "admin" && String(session.trainerId) !== requester.id) {
    const err = new Error("Brak dostępu");
    (err as any).status = 403;
    throw err;
  }

  const now = new Date();
  const startAt = toDateOrThrow(session.startAt, "startAt");
    const endAt = toDateOrThrow(session.endAt, "endAt");
    const canEdit = isNowWithin(startAt, endAt, now);

  const attendanceDocs = await Attendance.find({ sessionId: sid })
    .select("userId status")
    .lean();

  const attendanceMap = new Map<string, AttendanceStatus>();
  for (const a of attendanceDocs) {
    attendanceMap.set(String(a.userId), a.status as AttendanceStatus);
  }

  const participants: ParticipantAttendance[] = (session.participants ?? []).map((p: any) => ({
    id: String(p._id),
    name: p.name ?? "Użytkownik",
    status: attendanceMap.get(String(p._id)) ?? "absent",
  }));

  return {
    session: mapSessionSummary(session),
    canEdit,
    participants,
  };
}

export async function updateSessionAttendance(
  sessionId: string,
  requester: { id: string; role: "admin" | "trainer" | "user" },
  updates: Array<{ userId: string; status: AttendanceStatus }>
) {
  const sid = toObjectId(sessionId);
  if (!sid) {
    const err = new Error("Nieprawidłowe sessionId");
    (err as any).status = 400;
    throw err;
  }

  const session = await Session.findById(sid).select("trainerId startAt endAt participants").lean();
  if (!session) {
    const err = new Error("Zajęcia nie istnieją");
    (err as any).status = 404;
    throw err;
  }

  if (requester.role !== "admin" && String(session.trainerId) !== requester.id) {
    const err = new Error("Brak dostępu");
    (err as any).status = 403;
    throw err;
  }

    const startAt = toDateOrThrow(session.startAt, "startAt");
    const endAt = toDateOrThrow(session.endAt, "endAt");
    const canEdit = isNowWithin(startAt, endAt);

  if (!canEdit) {
    const err = new Error("Obecność można edytować tylko w trakcie trwania zajęć");
    (err as any).status = 409;
    throw err;
  }

  const allowedIds = new Set((session.participants ?? []).map((id: any) => String(id)));

  const ops = updates
    .filter((u) => allowedIds.has(u.userId))
    .map((u) => ({
      updateOne: {
        filter: { sessionId: sid, userId: new Types.ObjectId(u.userId) },
        update: {
          $set: {
            status: u.status,
            markedBy: new Types.ObjectId(requester.id),
            markedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

  if (ops.length > 0) {
    await Attendance.bulkWrite(ops, { ordered: false });
  }

  return getSessionAttendanceDetails(sessionId, requester);
}
