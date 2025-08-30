import { api } from "./client";

export type HealthDto = {
  service: string;
  status: string;
  uptimeSec: number;
  db?: string;
  time: string;
};

export async function fetchHealth(): Promise<HealthDto> {
  const { data } = await api.get<HealthDto>("/api/health");
  return data;
}
