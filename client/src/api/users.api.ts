import type { UpdateMyProfilePayload, UserProfileDto } from "@/types/userTypes";

import { http } from "./http";

export type GetMeResponse = { user: UserProfileDto };
export type PatchMeResponse = { user: UserProfileDto };

export async function getMeApi(token: string): Promise<GetMeResponse> {
  const res = await http.get<GetMeResponse>("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function patchMeApi(token: string, payload: UpdateMyProfilePayload): Promise<PatchMeResponse> {
  const res = await http.patch<PatchMeResponse>("/users/me", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
export { UpdateMyProfilePayload };

