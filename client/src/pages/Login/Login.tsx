import { FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import bgImage from "@/assets/images/bob.png";
import { Location, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import type { User } from "@/features/auth/auth.types";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

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
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await login(email, password);

      const state = isFromState(location.state) ? location.state : undefined;
      const target = state?.from?.pathname ?? roleHome(res.user.role);
      navigate(target, { replace: true });
    } catch (error: unknown) {
      if (isAxiosError(error)) setErr(error.response?.data?.message ?? "Błąd logowania");
      else if (error instanceof Error) setErr(error.message);
      else setErr("Nieznany błąd");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = email.length > 3 && password.length >= 6 && !loading;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, backdropFilter: "blur(6px)", bgcolor: "rgba(255,255,255,0.85)" }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Logowanie
          </Typography>

          {err && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {err}
            </Alert>
          )}

          <Box component="form" onSubmit={onSubmit} noValidate>
            <Stack spacing={2}>
              <TextField
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                fullWidth
              />
              <TextField
                label="Hasło"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={!canSubmit}
              >
                {loading ? "Logowanie…" : "Zaloguj"}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
            Problem z logowaniem? Skontaktuj się z administratorem klubu.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
