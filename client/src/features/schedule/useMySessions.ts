import { useQuery } from "@tanstack/react-query";
import { getMySessionsApi, ListSessionsResponse } from "@/api/schedule.api";
import { useAuth } from "@/features/auth/useAuth";

export function useMySessions(from?: string, to?: string) {
  const { token } = useAuth();

  return useQuery<ListSessionsResponse, unknown>({
    queryKey: ["my-sessions", from ?? null, to ?? null],
    enabled: !!token,
    queryFn: async () => {
      if (!token) throw new Error("Brak tokenu");
      return getMySessionsApi({ token, from, to });
    },
  });
}
