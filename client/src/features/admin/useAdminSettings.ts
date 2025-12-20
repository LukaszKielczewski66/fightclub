import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { getClubSettingsApi, updateClubSettingsApi } from "@/api/adminSettings.api";
import type { ClubSettings, UpdateClubSettingsPayload } from "@/types/adminSettings";

export function useClubSettings() {
  const { token } = useAuth();

  return useQuery<ClubSettings, unknown>({
    queryKey: ["admin-settings"],
    enabled: !!token,
    queryFn: async () => {
      if (!token) throw new Error("Brak tokenu");
      return getClubSettingsApi({ token });
    },
  });
}

export function useUpdateClubSettings() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation<ClubSettings, unknown, UpdateClubSettingsPayload>({
    mutationFn: async (payload) => {
      if (!token) throw new Error("Brak tokenu");
      return updateClubSettingsApi({ token, payload });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });
}
