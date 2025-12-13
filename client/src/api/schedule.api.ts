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
