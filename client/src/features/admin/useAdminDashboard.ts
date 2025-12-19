import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { getAdminDashboardApi } from "@/api/admin.dashboard.api";
import { AdminDashboardResponse } from "@/types/adminDashboard";

export function useAdminDashboard() {
  const { token } = useAuth();

  return useQuery<AdminDashboardResponse, unknown>({
    queryKey: ["admin-dashboard"],
    enabled: !!token,
    queryFn: async () => {
      if (!token) throw new Error("Brak tokenu");
      return getAdminDashboardApi({ token });
    },
    refetchInterval: 30_000,
  });
}
