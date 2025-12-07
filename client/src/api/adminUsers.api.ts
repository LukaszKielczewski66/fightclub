
import { CreatedUser, CreateUserPayload } from '@/types/adminUsers';
import { http } from './http'

export async function createUserApi(
  payload: CreateUserPayload,
  token: string
): Promise<CreatedUser> {
  const res = await http.post<CreatedUser>("/admin/users", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
