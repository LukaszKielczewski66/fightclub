import { AdminDashboardResponse } from "@/types/adminDashboard";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export async function getAdminDashboardApi(args: { token: string }) {
  const res = await fetch(`${API_URL}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${args.token}` },
  });

  const data = (await res.json()) as unknown;

  if (!res.ok) {
    const msg = (data as { message?: string })?.message ?? "Nie udało się pobrać dashboardu";
    throw new Error(msg);
  }

  return data as AdminDashboardResponse;
}
