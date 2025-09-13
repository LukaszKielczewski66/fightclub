import { api } from "./client";

export type LoginResponse = {
  accessToken: string;
  user: { id: string; email: string; name: string; role: "admin"|"trainer"|"client" };
};

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post("/api/auth/login", { email, password });
  console.log(data)
  return data;
}
