import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { AdminUserListItem, UpdateUserPayload } from "@/types/adminUsers";
import { updateUserApi } from "@/api/adminUsers.api";

interface UpdateUserArgs {
  id: string;
  data: UpdateUserPayload;
}

export function useUpdateUser() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<AdminUserListItem, unknown, UpdateUserArgs>({
    mutationFn: async ({ id, data }) => {
      if (!token) throw new Error("Brak tokenu – zaloguj się ponownie");
      return await updateUserApi(id, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
