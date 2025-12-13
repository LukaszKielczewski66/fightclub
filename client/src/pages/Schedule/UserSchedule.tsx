import {
  Box,
  Paper,
  Typography,
  useTheme,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import { useMemo, useState } from "react";
import { useScheduleSessions } from "@/features/schedule/useScheduleSessions";
import type { Level } from "@/api/schedule.api";
import { useAuth } from "@/features/auth/useAuth";

type SessionStatus = "booked" | "full" | "available";

const HOURS = [16, 17, 18, 19, 20, 21];

function startOfWeekMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmtDayShort(date: Date) {
  const dow = new Intl.DateTimeFormat("pl-PL", { weekday: "short" }).format(date);
  const ddmm = new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit" }).format(date);
  return `${dow.charAt(0).toUpperCase()}${dow.slice(1)} ${ddmm}`;
}

function fmtRange(from: Date, toExclusive: Date) {
  const a = new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit" }).format(from);
  const b = new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit" }).format(addDays(toExclusive, -1));
  return `${a} – ${b}`;
}

function statusChip(status: SessionStatus) {
  switch (status) {
    case "booked":
      return <Chip size="small" label="Zapisany" color="success" sx={{ height: 22, fontSize: 12 }} />;
    case "full":
      return <Chip size="small" label="Brak miejsc" color="error" sx={{ height: 22, fontSize: 12 }} />;
    case "available":
    default:
      return (
        <Chip
          size="small"
          label="Możesz się zapisać"
          color="primary"
          variant="outlined"
          sx={{ height: 22, fontSize: 12 }}
        />
      );
  }
}

function levelLabel(level: Level) {
  switch (level) {
    case "beginner":
      return "Początkujący";
    case "intermediate":
      return "Średniozaaw.";
    case "advanced":
      return "Zaawansowany";
    default:
      return level;
  }
}

export const UserSchedule = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { user } = useAuth();

  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const base = startOfWeekMonday(new Date());
    return addDays(base, weekOffset * 7);
  }, [weekOffset]);

  const weekEndExclusive = useMemo(() => addDays(weekStart, 7), [weekStart]);

  const fromIso = useMemo(() => weekStart.toISOString(), [weekStart]);
  const toIso = useMemo(() => weekEndExclusive.toISOString(), [weekEndExclusive]);

  const { data, isLoading, isError } = useScheduleSessions(fromIso, toIso);
  const sessions = data?.items ?? [];

  const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);

  function getSessionsForSlot(dayIndex: number, hour: number) {
    const day = days[dayIndex];
    return sessions.filter((s) => {
      const start = new Date(s.startAt);
      return (
        start.getFullYear() === day.getFullYear() &&
        start.getMonth() === day.getMonth() &&
        start.getDate() === day.getDate() &&
        start.getHours() === hour
      );
    });
  }

  function dayHasAnySessions(dayIndex: number) {
    const day = days[dayIndex];
    return sessions.some((s) => {
      const start = new Date(s.startAt);
      return (
        start.getFullYear() === day.getFullYear() &&
        start.getMonth() === day.getMonth() &&
        start.getDate() === day.getDate()
      );
    });
  }

  function getStatusForSession(s: (typeof sessions)[number]): SessionStatus {
    const isBooked = !!user && Array.isArray(s.participantsIds) && s.participantsIds.includes(user.id);

    if (isBooked) return "booked";
    if (s.reserved >= s.capacity) return "full";
    return "available";
  }

  const cardBg = isDark ? theme.palette.background.paper : theme.palette.grey[100];
  const gridBorder = alpha(theme.palette.divider, 0.9);
  const headerBg = isDark ? alpha(theme.palette.common.white, 0.04) : alpha(theme.palette.grey[900], 0.02);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, md: 2.5 },
        borderRadius: 3,
        backgroundColor: cardBg,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h6">Grafik zajęć</Typography>
          <Typography variant="body2" color="text.secondary">
            Tydzień: {fmtRange(weekStart, weekEndExclusive)}
          </Typography>
        </Box>

        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small" onClick={() => setWeekOffset((v) => v - 1)}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {weekOffset === 0 ? "Bieżący tydzień" : `${weekOffset > 0 ? "+" : ""}${weekOffset} tydz.`}
          </Typography>
          <IconButton size="small" onClick={() => setWeekOffset((v) => v + 1)}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2, flexWrap: "wrap" }}>
        <Typography variant="body2" color="text.secondary">
          Status:
        </Typography>
        {statusChip("booked")}
        {statusChip("available")}
        {statusChip("full")}
      </Stack>

      {isLoading && (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={28} />
        </Box>
      )}

      {isError && (
        <Typography color="error" variant="body2">
          Nie udało się pobrać grafiku z backendu.
        </Typography>
      )}

      {!isLoading && !isError && (
        <Box sx={{ width: "100%", overflowX: "auto", overflowY: "hidden", pb: 1 }}>
          <Box
            sx={{
              minWidth: 2000,
              display: "grid",
              gridTemplateColumns: `72px repeat(7, 1fr)`,
              gridAutoRows: "minmax(56px, auto)",
              border: `1px solid ${gridBorder}`,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {/* Header: godzina */}
            <Box
              sx={{
                backgroundColor: headerBg,
                borderBottom: `1px solid ${gridBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Godzina
              </Typography>
            </Box>

            {/* Header: dni tygodnia (z datą) */}
            {days.map((d) => (
              <Box
                key={d.toISOString()}
                sx={{
                  backgroundColor: headerBg,
                  borderBottom: `1px solid ${gridBorder}`,
                  borderLeft: `1px solid ${gridBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {fmtDayShort(d)}
              </Box>
            ))}

            {/* Grid */}
            {HOURS.map((hour) => (
              <Box key={hour} sx={{ display: "contents" }}>
                <Box
                  sx={{
                    borderTop: `1px solid ${gridBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "text.secondary",
                    px: 0.5,
                  }}
                >
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <AccessTimeIcon sx={{ fontSize: 14 }} />
                    <span>{hour}:00</span>
                  </Stack>
                </Box>

                {days.map((_, dayIndex) => {
                  const slotSessions = getSessionsForSlot(dayIndex, hour);
                  const hasAny = dayHasAnySessions(dayIndex);

                  return (
                    <Box
                      key={`${dayIndex}-${hour}`}
                      sx={{
                        borderTop: `1px solid ${gridBorder}`,
                        borderLeft: `1px solid ${gridBorder}`,
                        p: 0.5,
                        minHeight: 56,
                      }}
                    >
                      <Stack spacing={0.5}>
                        {slotSessions.map((s) => {
                          const reserved = s.reserved;
                          const free = Math.max(0, s.capacity - reserved);
                          const status = getStatusForSession(s);

                          return (
                            <Paper
                              key={s.id}
                              elevation={0}
                              sx={{
                                p: 0.75,
                                borderRadius: 1.5,
                                backgroundColor: alpha(
                                  status === "booked"
                                    ? theme.palette.success.main
                                    : status === "full"
                                    ? theme.palette.error.main
                                    : theme.palette.primary.main,
                                  isDark ? 0.18 : 0.1
                                ),
                                border: `1px solid ${alpha(
                                  status === "booked"
                                    ? theme.palette.success.main
                                    : status === "full"
                                    ? theme.palette.error.main
                                    : theme.palette.primary.main,
                                  0.6
                                )}`,
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                                {s.name}
                              </Typography>

                              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                {s.type} • {s.trainerName}
                              </Typography>

                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.25 }}>
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                  <Typography variant="caption" color="text.secondary">
                                    {levelLabel(s.level)}
                                  </Typography>

                                  <Stack direction="row" spacing={0.5} alignItems="center">
                                    <PeopleIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {reserved}/{s.capacity}
                                      {free > 0 && ` (${free} wolne)`}
                                    </Typography>
                                  </Stack>
                                </Stack>

                                {statusChip(status)}
                              </Stack>
                            </Paper>
                          );
                        })}

                        {hour === HOURS[0] && !hasAny && (
                          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                            Brak zajęć tego dnia
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};
