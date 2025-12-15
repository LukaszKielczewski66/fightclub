import { useQuery } from "@tanstack/react-query";
import { getTrainerAttendanceActiveApi } from "@/api/attendance.api";
import { useAuth } from "@/features/auth/useAuth";
import { ActiveAttendanceResponse } from "@/types/attendance";

export function useTrainerAttendanceActive() {
  const { token } = useAuth();

  return useQuery<ActiveAttendanceResponse, unknown>({
    queryKey: ["trainer-attendance-active"],
    enabled: !!token,
    queryFn: async () => {
      if (!token) throw new Error("Brak tokenu");
      return getTrainerAttendanceActiveApi({ token });
    },
    refetchInterval: 10_000,
  });
}
