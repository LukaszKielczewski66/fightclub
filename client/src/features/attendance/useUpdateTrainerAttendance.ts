import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchTrainerAttendanceApi } from "@/api/attendance.api";
import { useAuth } from "@/features/auth/useAuth";
import { AttendanceDetailsResponse, AttendanceStatus } from "@/types/attendance";

export function useUpdateTrainerAttendance() {
  const { token } = useAuth();
  const qc = useQueryClient();

return useMutation<
    AttendanceDetailsResponse,
    unknown,
    { sessionId: string; updates: Array<{ userId: string; status: AttendanceStatus }> }
  >({
    mutationFn: async ({ sessionId, updates }) => {
      if (!token) throw new Error("Brak tokenu");
      return patchTrainerAttendanceApi({ token, sessionId, updates });
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["trainer-attendance-active"] });
      qc.invalidateQueries({ queryKey: ["trainer-attendance-past"] });
      qc.invalidateQueries({ queryKey: ["trainer-attendance-details", vars.sessionId] });
    },
  });
}
