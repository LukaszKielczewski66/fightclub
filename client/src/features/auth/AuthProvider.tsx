import { useEffect, useMemo, useState } from "react";
import { AuthCtx } from "./AuthContext";
import type { AuthState, User } from "./auth.types";
import { setAuthToken } from "@/services/api/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("fc_token"));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("fc_user");
    return raw ? (JSON.parse(raw) as User) : null;
  });

  useEffect(() => setAuthToken(token), [token]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      token,
      login: (t, u) => {
        setToken(t);
        setUser(u);
        localStorage.setItem("fc_token", t);
        localStorage.setItem("fc_user", JSON.stringify(u));
      },
      logout: () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("fc_token");
        localStorage.removeItem("fc_user");
        setAuthToken(null);
      },
    }),
    [user, token]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
