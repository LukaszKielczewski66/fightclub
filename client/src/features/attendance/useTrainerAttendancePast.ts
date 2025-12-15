import { useQuery } from "@tanstack/react-query";
import { getTrainerAttendancePastApi } from "@/api/attendance.api";
import { useAuth } from "@/features/auth/useAuth";
import { PastAttendanceResponse } from "@/types/attendance";

export function useTrainerAttendancePast(limit = 50) {
  const { token } = useAuth();

  return useQuery<PastAttendanceResponse, unknown>({
    queryKey: ["trainer-attendance-past", limit],
    enabled: !!token,
    queryFn: async () => {
      if (!token) throw new Error("Brak tokenu");
      return getTrainerAttendancePastApi({ token, limit });
    },
  });
}
