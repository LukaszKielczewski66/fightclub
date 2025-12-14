import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unbookScheduleSessionApi, SessionDto } from "@/api/schedule.api";
import { useAuth } from "@/features/auth/useAuth";

export function useUnbookScheduleSession() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation<SessionDto, unknown, { sessionId: string }>({
    mutationFn: async ({ sessionId }) => {
      if (!token) throw new Error("Brak tokenu");
      return unbookScheduleSessionApi({ sessionId, token });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedule-sessions"] });
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });
}
