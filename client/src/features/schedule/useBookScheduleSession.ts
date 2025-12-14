import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookScheduleSessionApi, SessionDto } from "@/api/schedule.api";
import { useAuth } from "@/features/auth/useAuth";

export function useBookScheduleSession() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation<SessionDto, unknown, { sessionId: string }>({
    mutationFn: async ({ sessionId }) => {
      if (!token) throw new Error("Brak tokenu – zaloguj się ponownie");
      return bookScheduleSessionApi({ sessionId, token });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedule-sessions"] });
    },
  });
}
