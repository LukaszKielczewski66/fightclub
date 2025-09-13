export type Role = "admin" | "trainer" | "client";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
};
