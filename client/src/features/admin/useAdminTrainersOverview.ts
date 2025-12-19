import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { getAdminTrainersOverviewApi } from "@/api/adminTrainers.api";
import { AdminTrainerOverviewResponse, TrainersOverviewParams } from "@/types/adminTrainers";

export function useAdminTrainersOverview(params: TrainersOverviewParams) {
  const { token } = useAuth();

  return useQuery<AdminTrainerOverviewResponse, unknown>({
    queryKey: ["admin-trainers-overview", params],
    enabled: !!token,
    queryFn: async () => {
      if (!token) throw new Error("Brak tokenu");
      return getAdminTrainersOverviewApi(token, params);
    },
  });
}
