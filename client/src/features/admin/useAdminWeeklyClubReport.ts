import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { getAdminWeeklyClubReportApi } from "@/api/adminReports.api";
import type { AdminWeeklyClubReport } from "@/types/adminReports";

export function useAdminWeeklyClubReport(weekStartIso: string) {
  const { token } = useAuth();

  return useQuery<AdminWeeklyClubReport, unknown>({
    queryKey: ["admin-weekly-club-report", weekStartIso],
    enabled: !!token && !!weekStartIso,
    queryFn: async () => {
      if (!token) throw new Error("Brak tokenu");
      return getAdminWeeklyClubReportApi({ token, weekStartIso });
    },
  });
}
