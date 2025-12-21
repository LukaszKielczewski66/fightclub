import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
  Divider,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useClubSettings, useUpdateClubSettings } from "@/features/admin/useAdminSettings";
import { useThemeMode } from "@/features/theme/useThemeMode";

function getErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === "object" && "message" in err) {
    const e = err as { message?: unknown };
    if (typeof e.message === "string") return e.message;
  }
  return fallback;
}

export const AdminSettings = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const cardBg = isDark ? theme.palette.background.paper : theme.palette.grey[200];

  const { mode, toggleMode } = useThemeMode();
  const q = useClubSettings();
  const updateMut = useUpdateClubSettings();

  const [clubName, setClubName] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [timezone, setTimezone] = useState("Europe/Warsaw");

  const [maxBookingsPerWeek, setMaxBookingsPerWeek] = useState<number>(6);
  const [bookingCutoffHours, setBookingCutoffHours] = useState<number>(2);
  const [cancelCutoffHours, setCancelCutoffHours] = useState<number>(2);

  useEffect(() => {
    if (!q.data) return;
    setClubName(q.data.clubName);
    setAddress(q.data.address);
    setContactEmail(q.data.contactEmail);
    setContactPhone(q.data.contactPhone);
    setTimezone(q.data.timezone);

    setMaxBookingsPerWeek(q.data.maxBookingsPerWeek);
    setBookingCutoffHours(q.data.bookingCutoffHours);
    setCancelCutoffHours(q.data.cancelCutoffHours);
  }, [q.data]);

  const dirty = useMemo(() => {
    if (!q.data) return false;
    return (
      clubName !== q.data.clubName ||
      address !== q.data.address ||
      contactEmail !== q.data.contactEmail ||
      contactPhone !== q.data.contactPhone ||
      timezone !== q.data.timezone ||
      maxBookingsPerWeek !== q.data.maxBookingsPerWeek ||
      bookingCutoffHours !== q.data.bookingCutoffHours ||
      cancelCutoffHours !== q.data.cancelCutoffHours
    );
  }, [
    q.data,
    clubName,
    address,
    contactEmail,
    contactPhone,
    timezone,
    maxBookingsPerWeek,
    bookingCutoffHours,
    cancelCutoffHours,
  ]);

  const [okOpen, setOkOpen] = useState(false);
  const [errOpen, setErrOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  async function onSave() {
    setErrMsg("");
    try {
      await updateMut.mutateAsync({
        clubName,
        address,
        contactEmail,
        contactPhone,
        timezone,
        maxBookingsPerWeek,
        bookingCutoffHours,
        cancelCutoffHours,
      });
      setOkOpen(true);
    } catch (e: unknown) {
      setErrMsg(getErrorMessage(e, "Nie udało się zapisać ustawień"));
      setErrOpen(true);
    }
  }

  return (
    <Box minHeight="100vh" width="100%" py={{ xs: 4, md: 6 }} sx={{ backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="lg" sx={{ display: "grid", gap: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ sm: "center" }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              Ustawienia
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Prosta konfiguracja klubu i reguł zapisów.
            </Typography>
          </Box>

          <Button variant="contained" onClick={onSave} disabled={!dirty || updateMut.isPending || !q.data}>
            Zapisz
          </Button>
        </Stack>

        {q.isError ? <Alert severity="error">{getErrorMessage(q.error, "Nie udało się pobrać ustawień")}</Alert> : null}

        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, backgroundColor: cardBg }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Dane klubu
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <TextField label="Nazwa klubu" value={clubName} onChange={(e) => setClubName(e.target.value)} size="small" fullWidth />
            <TextField label="Adres" value={address} onChange={(e) => setAddress(e.target.value)} size="small" fullWidth />
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="E-mail kontaktowy"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label="Telefon kontaktowy"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                size="small"
                fullWidth
              />
            </Stack>
            <TextField
              label="Strefa czasowa"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              size="small"
              fullWidth
              helperText="Domyślnie: Europe/Warsaw"
            />
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, backgroundColor: cardBg }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Reguły zapisów
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <TextField
              label="Maks. zapisy użytkownika / tydzień"
              type="number"
              value={maxBookingsPerWeek}
              onChange={(e) => setMaxBookingsPerWeek(Number(e.target.value))}
              inputProps={{ min: 0, max: 50, step: 1 }}
              size="small"
              fullWidth
              helperText="0 = bez limitu"
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Zapis do (h przed startem)"
                type="number"
                value={bookingCutoffHours}
                onChange={(e) => setBookingCutoffHours(Number(e.target.value))}
                inputProps={{ min: 0, max: 168, step: 1 }}
                size="small"
                fullWidth
              />
              <TextField
                label="Wypis do (h przed startem)"
                type="number"
                value={cancelCutoffHours}
                onChange={(e) => setCancelCutoffHours(Number(e.target.value))}
                inputProps={{ min: 0, max: 168, step: 1 }}
                size="small"
                fullWidth
              />
            </Stack>

          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, backgroundColor: cardBg }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Wygląd aplikacji
          </Typography>
          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={<Switch checked={mode === "dark"} onChange={() => toggleMode()} />}
            label={mode === "dark" ? "Tryb ciemny" : "Tryb jasny"}
          />
        </Paper>

        <Snackbar open={okOpen} autoHideDuration={2500} onClose={() => setOkOpen(false)}>
          <Alert severity="success" variant="filled" onClose={() => setOkOpen(false)}>
            Zapisano ustawienia.
          </Alert>
        </Snackbar>

        <Snackbar open={errOpen} autoHideDuration={4500} onClose={() => setErrOpen(false)}>
          <Alert severity="error" variant="filled" onClose={() => setErrOpen(false)}>
            {errMsg || "Wystąpił błąd"}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};
