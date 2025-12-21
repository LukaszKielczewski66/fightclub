import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useAdminDashboard } from "@/features/admin/useAdminDashboard";

function fmtRange(isoFrom: string, isoTo: string) {
  const f = new Date(isoFrom);
  const t = new Date(isoTo);
  const df = new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit" }).format(f);
  const dt = new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit" }).format(t);
  return `${df} – ${dt}`;
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("pl-PL", { weekday: "short", day: "2-digit", month: "2-digit" }).format(d);
  const time = new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(d);
  return `${day} • ${time}`;
}

export const AdminDashboard = () => {
  const q = useAdminDashboard();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (q.isLoading) {
    return (
      <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (q.isError) {
    const msg = (q.error as { message?: string })?.message ?? "Błąd pobierania danych";
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{msg}</Alert>
      </Container>
    );
  }

  const data = q.data!;
  const k = data.kpis;

  const cardBg = isDark ? theme.palette.background.paper : theme.palette.grey[200];

  const Card = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        backgroundColor: cardBg,
        border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.18 : 0.10)}`,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
        {value}
      </Typography>
      {hint ? (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      ) : null}
    </Paper>
  );

  return (
    <Box
      minHeight="100vh"
      width="100%"
      py={{ xs: 4, md: 6 }}
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <Container maxWidth="lg" sx={{ display: "grid", gap: { xs: 3, md: 4 } }}>
        <Stack spacing={1}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Dashboard klubu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Zakres: {fmtRange(data.range.from, data.range.to)}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          <Card label="Użytkownicy" value={`${k.usersTotal}`} hint={`aktywni: ${k.usersActive}`} />
          <Card label="Trenerzy" value={`${k.trainersTotal}`} />
          <Card label="Zajęcia (zakres)" value={`${k.sessionsCount}`} hint={`zapisy: ${k.bookingsCount}`} />
          <Card label="Wypełnienie" value={`${k.fillRate}%`} hint={`miejsca: ${k.capacityTotal}`} />
          <Card
            label="Obecności oznaczone"
            value={`${k.attendanceMarked}`}
            hint={`P: ${k.attendancePresent} / N: ${k.attendanceAbsent}`}
          />
          <Card label="Frekwencja (z oznaczonych)" value={`${k.presentRate}%`} />
        </Box>

        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, backgroundColor: cardBg }} elevation={0}>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
            Najbliższe zajęcia (7 dni)
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {data.upcomingSessions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Brak nadchodzących zajęć.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Zajęcia</TableCell>
                  <TableCell>Trener</TableCell>
                  <TableCell align="right">Obłożenie</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.upcomingSessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{fmtDateTime(s.startAt)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {s.name}
                        </Typography>
                        <Chip size="small" label={`${s.type}/${s.level}`} />
                      </Stack>
                    </TableCell>
                    <TableCell>{s.trainerName}</TableCell>
                    <TableCell align="right">
                      {s.reserved}/{s.capacity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, backgroundColor: cardBg }} elevation={0}>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
            Top trenerzy (30 dni)
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {data.topTrainers.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Brak danych.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Trener</TableCell>
                  <TableCell align="right">Zajęcia</TableCell>
                  <TableCell align="right">Zapisy</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.topTrainers.map((t) => (
                  <TableRow key={t.trainerId}>
                    <TableCell>{t.trainerName}</TableCell>
                    <TableCell align="right">{t.sessionsCount}</TableCell>
                    <TableCell align="right">{t.bookingsCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Container>
    </Box>
  );
};
