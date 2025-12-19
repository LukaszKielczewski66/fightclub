import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { getTrainerWeeklyReportApi } from "@/api/reports.api";
import type { TrainerWeeklyReportResponse } from "@/types/reports";

export function useTrainerWeeklyReport(weekStartIso?: string) {
  const { token } = useAuth();

  return useQuery<TrainerWeeklyReportResponse, unknown>({
    queryKey: ["trainer-weekly-report", weekStartIso ?? null],
    enabled: !!token,
    queryFn: async () => {
      if (!token) throw new Error("Brak tokenu");
      return getTrainerWeeklyReportApi({ token, weekStart: weekStartIso });
    },
  });
}
