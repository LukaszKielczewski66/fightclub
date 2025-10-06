import type { User } from "@/features/auth/auth.types";

export type AuthState = {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

export const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle",
  error: null,
};