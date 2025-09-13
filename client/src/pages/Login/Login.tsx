import { FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import { loginApi } from "@/services/api/auth";
import { useAuth } from "@/features/auth/useAuth";
import { Location, useLocation, useNavigate } from "react-router-dom";
import type { User } from "@/features/auth/auth.types";

type FromState = { from?: Location };

function isFromState(v: unknown): v is FromState {
  return typeof v === "object" && v !== null && "from" in v;
}

function roleHome(role: User["role"]) {
  if (role === "admin") return "/admin";
  if (role === "trainer") return "/trainer";
  return "/app";
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const res = await loginApi(email, password);
      login(res.accessToken, res.user);

      const state = isFromState(location.state) ? location.state : undefined;
      const target = state?.from?.pathname ?? roleHome(res.user.role);

      navigate(target, { replace: true });
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        setErr(error.response?.data?.message ?? "Błąd logowania");
      } else if (error instanceof Error) {
        setErr(error.message);
      } else {
        setErr("Nieznany błąd");
      }
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", fontFamily: "system-ui" }}>
      <h1>Logowanie</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="E-mail"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Hasło"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Zaloguj</button>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>
    </div>
  );
}
