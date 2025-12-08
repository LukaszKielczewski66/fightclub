import { UserRole } from "@/models/User";

type CreateUserBody = {
  email: string;
  name: string;
  password: string;
  role: UserRole;
};

type ListUsersParams = {
  page: number;
  limit: number;
  query?: string; 
  role?: UserRole;
  active?: boolean;
  sort?: string;
};

type ListUserItem = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string; 
};

type ListUsersResult = {
  items: ListUserItem[];
  total: number;
  page: number;
  limit: number;
};

type UserDetails = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface UpdateUserParams {
  id: string;
  name?: string;
  role?: UserRole;
  active?: boolean;
}

type UpdateUserBody = {
  name?: string;
  role?: UserRole;
  active?: boolean;
};

export {
    CreateUserBody,
    ListUsersParams,
    ListUserItem,
    ListUsersResult,
    UserDetails,
    UpdateUserBody
}