import { http } from "./http";
import type { ClubSettings, UpdateClubSettingsPayload } from "@/types/adminSettings";

export async function getClubSettingsApi(args: { token: string }): Promise<ClubSettings> {
  const res = await http.get<ClubSettings>("/admin/settings", {
    headers: { Authorization: `Bearer ${args.token}` },
  });
  return res.data;
}

export async function updateClubSettingsApi(args: { token: string; payload: UpdateClubSettingsPayload }): Promise<ClubSettings> {
  const res = await http.put<ClubSettings>("/admin/settings", args.payload, {
    headers: { Authorization: `Bearer ${args.token}` },
  });
  return res.data;
}
