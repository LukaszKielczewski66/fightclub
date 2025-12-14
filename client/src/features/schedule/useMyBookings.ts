import { useQuery } from "@tanstack/react-query";
import { getMyBookingsApi, ListSessionsResponse } from "@/api/schedule.api";
import { useAuth } from "@/features/auth/useAuth";

export function useMyBookings(from?: string, to?: string) {
  const { token } = useAuth();

  return useQuery<ListSessionsResponse, unknown>({
    queryKey: ["my-bookings", from ?? null, to ?? null],
    enabled: !!token,
    queryFn: async () => {
      if (!token) throw new Error("Brak tokenu");
      return getMyBookingsApi({ token, from, to });
    },
  });
}
