import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { TrainerWeekDayReport, TrainerWeekSessionReport } from "@/types/reports";
import { useTrainerWeeklyReport } from "@/features/reports/useTrainerWeeklyReport";

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

function fmtDayLabel(dateIso: string) {
  const d = new Date(dateIso);
  return new Intl.DateTimeFormat("pl-PL", { weekday: "short" }).format(d);
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function sumSessions(days: TrainerWeekDayReport[]) {
  const out: TrainerWeekSessionReport[] = [];
  for (const d of days) out.push(...d.sessions);
  return out;
}

export default function TrainerReports() {
  const [weekStart, setWeekStart] = useState(() => startOfWeekMondayLocal(new Date()));
  const weekStartIso = useMemo(() => weekStart.toISOString(), [weekStart]);

  const { data, isLoading, isError, error } = useTrainerWeeklyReport(weekStartIso);

  const rangeLabel = useMemo(() => fmtWeekRange(weekStartIso), [weekStartIso]);

  const maxPresent = useMemo(() => {
    const v = data?.days?.map((d) => d.present) ?? [];
    return Math.max(1, ...v);
  }, [data]);

  const allSessions = useMemo(() => (data ? sumSessions(data.days) : []), [data]);

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        gap={2}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Raport trenera — tydzień
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {rangeLabel}
          </Typography>
        </Box>

        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <Button variant="outlined" onClick={() => setWeekStart((d) => addDays(d, -7))}>
            ← Poprzedni
          </Button>
          <Button variant="outlined" onClick={() => setWeekStart(startOfWeekMondayLocal(new Date()))}>
            Bieżący
          </Button>
          <Button variant="outlined" onClick={() => setWeekStart((d) => addDays(d, 7))}>
            Następny →
          </Button>

          <TextField
            type="date"
            size="small"
            label="Skocz do"
            InputLabelProps={{ shrink: true }}
            value={weekStartIso.slice(0, 10)}
            onChange={(e) => {
              const picked = new Date(e.target.value);
              if (!Number.isNaN(picked.getTime())) setWeekStart(startOfWeekMondayLocal(picked));
            }}
            sx={{ minWidth: 160 }}
          />
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {isLoading && (
        <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error">
          {error instanceof Error
            ? error.message
            : "Nie udało się pobrać raportu"}
        </Alert>
      )}

      {data && (
        <>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(4, 1fr)",
              },
            }}
          >
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Zajęcia
              </Typography>
              <Typography variant="h5">{data.totals.sessionsCount}</Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Godziny
              </Typography>
              <Typography variant="h5">{data.totals.hours}</Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Zapisani (łącznie)
              </Typography>
              <Typography variant="h5">{data.totals.reserved}</Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Frekwencja
              </Typography>
              <Typography variant="h5">
                {data.totals.present}/{data.totals.reserved}{" "}
                <Typography component="span" variant="body2" color="text.secondary">
                  ({pct(data.totals.avgAttendanceRate)})
                </Typography>
              </Typography>
            </Paper>
          </Box>

          <Box
            sx={{
              mt: 2,
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
          >
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Obecni w tygodniu (per dzień)
              </Typography>

              <Stack direction="row" gap={1.5} alignItems="flex-end" sx={{ mt: 2, height: 160 }}>
                {data.days.map((d) => {
                  const h = Math.round((d.present / maxPresent) * 140) + 10;
                  return (
                    <Box key={d.date} sx={{ width: "14%", textAlign: "center" }}>
                      <Box
                        sx={{
                          height: h,
                          borderRadius: 2,
                          bgcolor: "primary.main",
                          opacity: 0.85,
                        }}
                        title={`${fmtDayLabel(d.date)}: ${d.present}`}
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        {fmtDayLabel(d.date)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {d.present}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                * Jeśli nie oznaczono obecności, traktujemy zapisanych jako “nieobecnych” (do czasu oznaczenia).
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Podsumowanie dni
              </Typography>

              <Stack gap={1.25} sx={{ mt: 1 }}>
                {data.days.map((d) => (
                  <Stack key={d.date} direction="row" justifyContent="space-between">
                    <Typography variant="body2">
                      {fmtDayLabel(d.date)} — {d.sessionsCount} zaj.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {d.hours}h • {d.present}/{d.reserved}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Box>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Zajęcia w tym tygodniu
            </Typography>

            {allSessions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Brak zajęć w wybranym tygodniu.
              </Typography>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "260px 180px 140px 120px 160px",
                    gap: 1,
                    minWidth: 900,
                    fontSize: 14,
                    alignItems: "center",
                  }}
                >
                  <Typography fontWeight={700}>Zajęcia</Typography>
                  <Typography fontWeight={700}>Termin</Typography>
                  <Typography fontWeight={700}>Typ/Poziom</Typography>
                  <Typography fontWeight={700}>Zapisani</Typography>
                  <Typography fontWeight={700}>Obecni</Typography>

                  {allSessions.map((s) => {
                    const rate = s.reserved > 0 ? s.present / s.reserved : 0;
                    return (
                      <Box key={s.id} sx={{ display: "contents" }}>
                        <Typography>{s.name}</Typography>
                        <Typography color="text.secondary">{fmtDateTime(s.startAt)}</Typography>
                        <Typography color="text.secondary">
                          {s.type}/{s.level}
                        </Typography>
                        <Typography>{s.reserved}</Typography>
                        <Typography>
                          {s.present}/{s.reserved}{" "}
                          <Typography component="span" variant="caption" color="text.secondary">
                            ({pct(rate)})
                          </Typography>
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Paper>
        </>
      )}
    </Paper>
  );
}
