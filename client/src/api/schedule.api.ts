import { http } from "./http";

export type Level = "beginner" | "intermediate" | "advanced";
export type SessionType = "BJJ" | "MMA" | "Cross";

export type SessionDto = {
  id: string;
  name: string;
  type: SessionType;
  trainerName: string;
  level: Level;
  capacity: number;
  startAt: string;
  endAt: string;
  reserved: number;
  participantsIds: string[];
};

export type CreateSessionPayload = {
  name: string;
  type: SessionType;
  level: Level;
  capacity: number;
  weekStart: string;
  weekday: number;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
};


export type ListSessionsResponse = { items: SessionDto[] };

export async function getScheduleSessionsApi(args: {
  from: string;
  to: string;
  token: string;
}): Promise<ListSessionsResponse> {
  const res = await http.get<ListSessionsResponse>("/schedule/sessions", {
    params: { from: args.from, to: args.to },
    headers: { Authorization: `Bearer ${args.token}` },
  });
  return res.data;
}

export async function createScheduleSessionApi(args: {
  payload: CreateSessionPayload;
  token: string;
}): Promise<SessionDto> {
  const res = await http.post<SessionDto>("/schedule/sessions", args.payload, {
    headers: { Authorization: `Bearer ${args.token}` },
  });
  return res.data;
}

export async function getMySessionsApi(args: {
  token: string;
  from?: string;
  to?: string;
}): Promise<ListSessionsResponse> {
  const res = await http.get<ListSessionsResponse>("/schedule/my-sessions", {
    headers: { Authorization: `Bearer ${args.token}` },
    params: {
      from: args.from ?? undefined,
      to: args.to ?? undefined,
    },
  });
  return res.data;
}

export async function bookScheduleSessionApi(args: {
  sessionId: string;
  token: string;
}): Promise<SessionDto> {
  const res = await http.post<SessionDto>(
    `/schedule/sessions/${args.sessionId}/book`,
    {},
    { headers: { Authorization: `Bearer ${args.token}` } }
  );
  return res.data;
}

export async function getMyBookingsApi(args: {
  token: string;
  from?: string;
  to?: string;
}): Promise<ListSessionsResponse> {
  const res = await http.get<ListSessionsResponse>("/schedule/my-bookings", {
    headers: { Authorization: `Bearer ${args.token}` },
    params: {
      from: args.from ?? undefined,
      to: args.to ?? undefined,
    },
  });
  return res.data;
}


export async function unbookScheduleSessionApi(args: {
  sessionId: string;
  token: string;
}): Promise<SessionDto> {
  const res = await http.delete<SessionDto>(`/schedule/sessions/${args.sessionId}/book`, {
    headers: { Authorization: `Bearer ${args.token}` },
  });
  return res.data;
}



