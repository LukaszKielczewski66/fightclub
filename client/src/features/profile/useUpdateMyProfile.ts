import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchMeApi, PatchMeResponse } from "@/api/users.api";
import type { UpdateMyProfilePayload } from "@/types/userTypes";
import { useAuth } from "@/features/auth/useAuth";

export function useUpdateMyProfile() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation<PatchMeResponse, unknown, UpdateMyProfilePayload>({
    mutationFn: async (payload) => {
      if (!token) throw new Error("Brak tokenu");
      return patchMeApi(token, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}