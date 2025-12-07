export type Role = "admin" | "trainer" | "user";

export interface CreateUserPayload {
  email: string;
  name: string;
  password: string;
  role: Role;
}

export interface CreatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersListParams {
  page?: number;
  limit?: number;
  query?: string;
  role?: Role;
  active?: boolean;
  sort?: string;
}

export interface AdminUsersListResponse {
  items: AdminUserListItem[];
  total: number;
  page: number;
  limit: number;
}