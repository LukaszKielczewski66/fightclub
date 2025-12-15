import { ActiveAttendanceResponse, AttendanceDetailsResponse, AttendanceStatus, PastAttendanceResponse } from "@/types/attendance";
import { http } from "./http";



export async function getTrainerAttendanceActiveApi(args: {
  token: string;
}): Promise<ActiveAttendanceResponse> {
  const res = await http.get<ActiveAttendanceResponse>("/trainer/attendance/active", {
    headers: { Authorization: `Bearer ${args.token}` },
  });
  return res.data;
}

export async function getTrainerAttendancePastApi(args: {
  token: string;
  limit?: number;
}): Promise<PastAttendanceResponse> {
  const res = await http.get<PastAttendanceResponse>("/trainer/attendance/past", {
    headers: { Authorization: `Bearer ${args.token}` },
    params: { limit: args.limit ?? undefined },
  });
  return res.data;
}

export async function getTrainerAttendanceDetailsApi(args: {
  token: string;
  sessionId: string;
}): Promise<AttendanceDetailsResponse> {
  const res = await http.get<AttendanceDetailsResponse>(`/trainer/attendance/${args.sessionId}`, {
    headers: { Authorization: `Bearer ${args.token}` },
  });
  return res.data;
}

export async function patchTrainerAttendanceApi(args: {
  token: string;
  sessionId: string;
  updates: Array<{ userId: string; status: AttendanceStatus }>;
}): Promise<AttendanceDetailsResponse> {
  const res = await http.patch<AttendanceDetailsResponse>(
    `/trainer/attendance/${args.sessionId}`,
    { updates: args.updates },
    { headers: { Authorization: `Bearer ${args.token}` } }
  );
  return res.data;
}