import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserApi } from "@/api/adminUsers.api";
import { useAuth } from "@/features/auth/useAuth";
import { CreatedUser, CreateUserPayload } from "@/types/adminUsers";

export function useCreateUser() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation<CreatedUser, unknown, CreateUserPayload>({
    mutationFn: async (payload) => {
      if (!token) {
        throw new Error("Brak tokenu – zaloguj się ponownie");
      }
      return await createUserApi(payload, token);
    },
    onSuccess: () => {
    // TODO
    // queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return mutation;
}