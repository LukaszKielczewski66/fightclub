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