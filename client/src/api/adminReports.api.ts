import { http } from "./http";
import type { AdminWeeklyClubReport } from "@/types/adminReports";

export async function getAdminWeeklyClubReportApi(args: { token: string; weekStartIso: string }) {
  const res = await http.get<AdminWeeklyClubReport>("/admin/reports/weekly", {
    headers: { Authorization: `Bearer ${args.token}` },
    params: { weekStart: args.weekStartIso },
  });

  return res.data;
}
