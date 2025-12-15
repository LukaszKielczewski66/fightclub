import { useQuery } from "@tanstack/react-query";
import { getTrainerAttendanceDetailsApi } from "@/api/attendance.api";
import { useAuth } from "@/features/auth/useAuth";
import { AttendanceDetailsResponse } from "@/types/attendance";

export function useTrainerAttendanceDetails(sessionId: string | null) {
  const { token } = useAuth();

  return useQuery<AttendanceDetailsResponse, unknown>({
    queryKey: ["trainer-attendance-details", sessionId],
    enabled: !!token && !!sessionId,
    queryFn: async () => {
      if (!token) throw new Error("Brak tokenu");
      if (!sessionId) throw new Error("Brak sessionId");
      return getTrainerAttendanceDetailsApi({ token, sessionId });
    },
  });
}
