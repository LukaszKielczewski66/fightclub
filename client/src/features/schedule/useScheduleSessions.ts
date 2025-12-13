import { useQuery } from "@tanstack/react-query";
import { getScheduleSessionsApi, ListSessionsResponse } from "@/api/schedule.api";
import { useAuth } from "@/features/auth/useAuth";

export function useScheduleSessions(fromIso: string, toIso: string) {
  const { token } = useAuth();

  return useQuery<ListSessionsResponse, unknown>({
    queryKey: ["schedule-sessions", fromIso, toIso],
    enabled: !!token && !!fromIso && !!toIso,
    queryFn: async () => {
      if (!token) throw new Error("Brak tokenu – zaloguj się ponownie");
      return getScheduleSessionsApi({ from: fromIso, to: toIso, token });
    },
  });
}
