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