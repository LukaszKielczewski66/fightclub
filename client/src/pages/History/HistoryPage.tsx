import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";

import type { Level } from "@/api/schedule.api";
import { useMyBookings } from "@/features/schedule/useMyBookings";
import { useUnbookScheduleSession } from "@/features/schedule/useUnbookScheduleSession";

function levelLabel(level: Level) {
  if (level === "beginner") return "Początkujący";
  if (level === "intermediate") return "Średniozaaw.";
  return "Zaawansowany";
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

function durationMin(startIso: string, endIso: string) {
  const a = new Date(startIso).getTime();
  const b = new Date(endIso).getTime();
  return Math.max(0, Math.round((b - a) / 60000));
}

function startOfTodayLocal() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function HistoryPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // zakres: max 30 dni wstecz (włącznie)
  const to = useMemo(() => startOfTodayLocal(), []);
  const from = useMemo(() => {
    const d = new Date(to);
    d.setDate(d.getDate() - 30);
    return d;
  }, [to]);

  // endpoint filtruje po startAt: >= from i < to+1d (tu bierzemy to jako "dziś 00:00", więc bierzemy też dziś jeśli chcesz:
  // jeśli chcesz "do teraz", użyj new Date() jako toIso.
  const fromIso = useMemo(() => from.toISOString(), [from]);
  const toIso = useMemo(() => new Date().toISOString(), []);

  const { data, isLoading, isError } = useMyBookings(fromIso, toIso);

  // w historii przycisk "Wypisz" raczej bez sensu (bo to przeszłość),
  // ale jeśli chcesz go zostawić (np. gdy sesja jeszcze dziś i user jednak zapisany), to zostawiam jako opcję:
  const unbookMut = useUnbookScheduleSession();
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const itemsSorted = useMemo(() => {
    const items = data?.items ?? [];
    return [...items].sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
  }, [data?.items]);

  const cardBg = isDark ? theme.palette.background.paper : theme.palette.grey[100];

  async function handleUnbook(sessionId: string) {
    try {
      await unbookMut.mutateAsync({ sessionId });
      setErrMsg(null);
    } catch (e: unknown) {
      let msg = "Nie udało się wypisać";
      if (typeof e === "object" && e !== null) {
        const maybeAxios = e as { response?: { data?: { message?: string } }; message?: string };
        msg = maybeAxios.response?.data?.message ?? maybeAxios.message ?? msg;
      }
      setErrMsg(msg);
    }
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, md: 2.5 },
          borderRadius: 3,
          backgroundColor: cardBg,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Historia zapisów
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Zajęcia z ostatnich 30 dni, na które byłeś zapisany.
        </Typography>

        {errMsg && (
          <Typography variant="body2" color="error" sx={{ mb: 1.5 }}>
            {errMsg}
          </Typography>
        )}

        {isLoading && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={28} />
          </Box>
        )}

        {isError && (
          <Typography color="error" variant="body2">
            Nie udało się pobrać historii.
          </Typography>
        )}

        {!isLoading && !isError && itemsSorted.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Brak zapisów w ostatnich 30 dniach.
          </Typography>
        )}

        {!isLoading &&
          !isError &&
          itemsSorted.map((s) => {
            const reserved = s.reserved ?? 0;
            const dur = durationMin(s.startAt, s.endAt);

            const isPast = new Date(s.endAt).getTime() < Date.now();

            return (
              <Accordion
                key={s.id}
                disableGutters
                sx={{
                  mt: 1.25,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ width: "100%" }}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      alignItems={{ xs: "flex-start", md: "center" }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                          {s.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {s.type} • {s.trainerName} • {levelLabel(s.level)}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip size="small" label={`${fmtDateTime(s.startAt)} • ${dur} min`} variant="outlined" />
                        <Chip size="small" label={`${reserved}/${s.capacity}`} variant="outlined" />
                        {isPast && <Chip size="small" label="Zakończone" color="default" variant="outlined" />}
                      </Stack>
                    </Stack>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Start: <strong>{fmtDateTime(s.startAt)}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Koniec: <strong>{fmtDateTime(s.endAt)}</strong>
                    </Typography>

                    {/* Opcjonalnie: pozwól wypisać się tylko jeśli jeszcze nie minęły */}
                    {!isPast && (
                      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                        <Button
                          color="error"
                          variant="outlined"
                          onClick={() => handleUnbook(s.id)}
                          disabled={unbookMut.isPending}
                        >
                          Wypisz
                        </Button>
                      </Box>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
      </Paper>
    </Box>
  );
}
