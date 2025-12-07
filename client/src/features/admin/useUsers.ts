import { useQuery } from "@tanstack/react-query";
import {
  getUsersApi,
  AdminUsersListParams,
  AdminUsersListResponse,
} from "@/api/adminUsers.api";
import { useAuth } from "@/features/auth/useAuth";

export function useUsers(params: AdminUsersListParams = {}) {
  const { token } = useAuth();

  return useQuery<AdminUsersListResponse, unknown>({
    queryKey: ["admin-users", params],
    enabled: !!token,
    queryFn: () => {
      if (!token) throw new Error("Brak tokenu");
      return getUsersApi(token, params);
    },
  });
}
