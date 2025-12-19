import { AdminTrainerOverviewResponse, TrainersOverviewParams } from "@/types/adminTrainers";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";


type ApiError = { message?: string };


export async function getAdminTrainersOverviewApi(token: string, params: TrainersOverviewParams = {}) {
  const qs = new URLSearchParams();
  if (params.query) qs.set("query", params.query);
  if (typeof params.active === "boolean") qs.set("active", params.active ? "true" : "false");
  if (params.sort) qs.set("sort", params.sort);

  const res = await fetch(`${API_URL}/api/admin/trainers/overview?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
    const data: unknown = await res.json();

    if (!res.ok) {
    const err = data as ApiError;
    throw new Error(err?.message ?? "Nie udało się pobrać trenerów");
    }

    return data as AdminTrainerOverviewResponse;
}
