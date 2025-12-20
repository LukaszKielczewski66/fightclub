import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { useAdminWeeklyClubReport } from "@/features/admin/useAdminWeeklyClubReport";

function startOfWeekMondayLocal(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function fmtWeekRange(weekStartIso: string) {
  const start = new Date(weekStartIso);
  const end = addDays(start, 6);
  const f = new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit" });
  return `${f.format(start)} – ${f.format(end)}`;
}

function fmtDay(iso: string) {
  const d = new Date(iso);
  const wd = new Intl.DateTimeFormat("pl-PL", { weekday: "short" }).format(d);
  const dt = new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit" }).format(d);
  return `${wd} ${dt}`;
}

function getErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === "object" && "message" in err) {
    const e = err as { message?: unknown };
    if (typeof e.message === "string") return e.message;
  }
  return fallback;
}

export const AdminReports = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const cardBg = isDark ? theme.palette.background.paper : theme.palette.grey[200];

  const [weekStart, setWeekStart] = useState(() => startOfWeekMondayLocal(new Date()));
  const weekStartIso = useMemo(() => weekStart.toISOString(), [weekStart]);

  const q = useAdminWeeklyClubReport(weekStartIso);

  const rangeLabel = useMemo(() => fmtWeekRange(weekStartIso), [weekStartIso]);

  const Card = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, backgroundColor: cardBg }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>{value}</Typography>
      {hint ? <Typography variant="caption" color="text.secondary">{hint}</Typography> : null}
    </Paper>
  );

  return (
    <Box minHeight="100vh" width="100%" py={{ xs: 4, md: 6 }} sx={{ backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="lg" sx={{ display: "grid", gap: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ sm: "center" }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>Raporty klubu</Typography>
            <Typography variant="body2" color="text.secondary">Tydzień: {rangeLabel}</Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => setWeekStart(addDays(weekStart, -7))}>← Poprzedni</Button>
            <Button variant="outlined" onClick={() => setWeekStart(startOfWeekMondayLocal(new Date()))}>Bieżący</Button>
            <Button variant="outlined" onClick={() => setWeekStart(addDays(weekStart, 7))}>Następny →</Button>
          </Stack>
        </Stack>

        {q.isLoading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : null}

        {q.isError ? (
          <Alert severity="error">{getErrorMessage(q.error, "Nie udało się pobrać raportu")}</Alert>
        ) : null}

        {q.data ? (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
              <Card label="Zajęcia" value={`${q.data.totals.sessionsCount}`} hint={`godziny: ${q.data.totals.hours}`} />
              <Card label="Zapisy" value={`${q.data.totals.reserved}`} hint={`miejsca: ${q.data.totals.capacity}`} />
              <Card label="Obłożenie" value={`${q.data.totals.fillRate}%`} />
              <Card label="Frekwencja" value={`${q.data.totals.attendanceRate}%`} hint={`P: ${q.data.totals.present} / N: ${q.data.totals.absent}`} />
            </Box>

            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, backgroundColor: cardBg }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Dni tygodnia</Typography>
              <Divider sx={{ mb: 2 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Dzień</TableCell>
                    <TableCell align="right">Zajęcia</TableCell>
                    <TableCell align="right">Godz.</TableCell>
                    <TableCell align="right">Zapisy</TableCell>
                    <TableCell align="right">Obłożenie</TableCell>
                    <TableCell align="right">P/N</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {q.data.days.map((d) => (
                    <TableRow key={d.date}>
                      <TableCell>{fmtDay(d.date)}</TableCell>
                      <TableCell align="right">{d.sessionsCount}</TableCell>
                      <TableCell align="right">{d.hours}</TableCell>
                      <TableCell align="right">{d.reserved}/{d.capacity}</TableCell>
                      <TableCell align="right">{d.fillRate}%</TableCell>
                      <TableCell align="right">{d.present}/{d.absent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, backgroundColor: cardBg }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Typy zajęć</Typography>
              <Divider sx={{ mb: 2 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Typ</TableCell>
                    <TableCell align="right">Zajęcia</TableCell>
                    <TableCell align="right">Godz.</TableCell>
                    <TableCell align="right">Zapisy</TableCell>
                    <TableCell align="right">Obłożenie</TableCell>
                    <TableCell align="right">P/N</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {q.data.byType.map((t) => (
                    <TableRow key={t.type}>
                      <TableCell>{t.type}</TableCell>
                      <TableCell align="right">{t.sessionsCount}</TableCell>
                      <TableCell align="right">{t.hours}</TableCell>
                      <TableCell align="right">{t.reserved}/{t.capacity}</TableCell>
                      <TableCell align="right">{t.fillRate}%</TableCell>
                      <TableCell align="right">{t.present}/{t.absent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, backgroundColor: cardBg }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Top (najlepsze obłożenie)</Typography>
                <Divider sx={{ mb: 2 }} />
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Zajęcia</TableCell>
                      <TableCell align="right">Obł.</TableCell>
                      <TableCell align="right">Zapisy</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {q.data.topBest.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {s.type}/{s.level} • {s.trainerName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{s.fillRate}%</TableCell>
                        <TableCell align="right">{s.reserved}/{s.capacity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>

              <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, backgroundColor: cardBg }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Słabe (najniższe obłożenie)</Typography>
                <Divider sx={{ mb: 2 }} />
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Zajęcia</TableCell>
                      <TableCell align="right">Obł.</TableCell>
                      <TableCell align="right">Zapisy</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {q.data.topWorst.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {s.type}/{s.level} • {s.trainerName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{s.fillRate}%</TableCell>
                        <TableCell align="right">{s.reserved}/{s.capacity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          </>
        ) : null}
      </Container>
    </Box>
  );
};
