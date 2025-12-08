
import type { AdminUserListItem, AdminUsersListParams, AdminUsersListResponse, CreatedUser, CreateUserPayload, UpdateUserPayload } from '@/types/adminUsers';
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


export async function getUsersApi(
  token: string,
  params: AdminUsersListParams = {}
): Promise<AdminUsersListResponse> {
  const res = await http.get<AdminUsersListResponse>("/admin/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      query: params.query ?? undefined,
      role: params.role ?? undefined,
      active:
        typeof params.active === "boolean" ? String(params.active) : undefined,
      sort: params.sort ?? "createdAt:desc",
    },
  });

  return res.data;
}

export async function updateUserApi(
  id: string,
  payload: UpdateUserPayload,
  token: string
): Promise<AdminUserListItem> {
  const res = await http.patch<AdminUserListItem>(
    `/admin/users/${id}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export { AdminUsersListParams, AdminUsersListResponse };
