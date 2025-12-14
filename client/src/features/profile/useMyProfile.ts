import { useQuery } from "@tanstack/react-query";
import { getMeApi, GetMeResponse } from "@/api/users.api";
import { useAuth } from "@/features/auth/useAuth";

export function useMyProfile() {
  const { token } = useAuth();

  return useQuery<GetMeResponse, unknown>({
    queryKey: ["me"],
    enabled: !!token,
    queryFn: async () => {
      if (!token) throw new Error("Brak tokenu");
      return getMeApi(token);
    },
  });
}
