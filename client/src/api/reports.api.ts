import { http } from "./http";
import type { TrainerWeeklyReportResponse } from "@/types/reports";

export async function getTrainerWeeklyReportApi(args: {
  token: string;
  weekStart?: string;
}): Promise<TrainerWeeklyReportResponse> {
  const res = await http.get<TrainerWeeklyReportResponse>("/trainer/reports/weekly", {
    headers: { Authorization: `Bearer ${args.token}` },
    params: { weekStart: args.weekStart ?? undefined },
  });
  return res.data;
}
