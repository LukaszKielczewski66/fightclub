import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import { alpha } from "@mui/material/styles";
import { useMemo } from "react";
import { useMySessions } from "@/features/schedule/useMySessions";
import type { Level } from "@/api/schedule.api";

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

export default function TrainerMySessions() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { data, isLoading, isError } = useMySessions();

  const cardBg = isDark ? theme.palette.background.paper : theme.palette.grey[100];

  const sorted = useMemo(() => {
    const items = data?.items ?? [];
    return [...items].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
  }, [data?.items]);

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
          Moje zajęcia
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Lista zajęć, które poprowadzisz (kliknij, aby zobaczyć szczegóły).
        </Typography>

        {isLoading && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={28} />
          </Box>
        )}

        {isError && (
          <Typography color="error" variant="body2">
            Nie udało się pobrać listy zajęć.
          </Typography>
        )}

        {!isLoading && !isError && sorted.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Brak zaplanowanych zajęć.
          </Typography>
        )}

        {!isLoading &&
          !isError &&
          sorted.map((s) => {
            const reserved = s.reserved ?? 0;
            const free = Math.max(0, s.capacity - reserved);
            const dur = durationMin(s.startAt, s.endAt);

            const fullness =
              reserved >= s.capacity ? "full" : reserved / Math.max(1, s.capacity) >= 0.8 ? "almost" : "ok";

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
                        <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          {s.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {s.type} • {levelLabel(s.level)}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip
                          size="small"
                          icon={<AccessTimeIcon />}
                          label={`${fmtDateTime(s.startAt)} • ${dur} min`}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          icon={<PeopleIcon />}
                          label={`${reserved}/${s.capacity}${free > 0 ? ` (${free} wolne)` : ""}`}
                          color={fullness === "full" ? "error" : fullness === "almost" ? "warning" : "default"}
                          variant={fullness === "ok" ? "outlined" : "filled"}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Stack spacing={0.75}>
                    <Typography variant="body2" color="text.secondary">
                      Start: <strong>{fmtDateTime(s.startAt)}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Koniec: <strong>{fmtDateTime(s.endAt)}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Trener: <strong>{s.trainerName}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Uczestników: <strong>{reserved}</strong>
                    </Typography>

                    {/* na razie pokazujemy ID uczestników (pod przyszłe widoki), ale możesz to ukryć */}
                    {Array.isArray(s.participantsIds) && s.participantsIds.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          IDs uczestników:
                        </Typography>
                        <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                          {s.participantsIds.join(", ")}
                        </Typography>
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
