import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createScheduleSessionApi, CreateSessionPayload, SessionDto } from "@/api/schedule.api";
import { useAuth } from "@/features/auth/useAuth";

export function useCreateScheduleSession() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation<SessionDto, unknown, CreateSessionPayload>({
    mutationFn: async (payload) => {
      if (!token) throw new Error("Brak tokenu – zaloguj się ponownie");
      return createScheduleSessionApi({ payload, token });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedule-sessions"] });
    },
  });
}
