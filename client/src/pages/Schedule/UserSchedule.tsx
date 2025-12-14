import {
  Box,
  Paper,
  Typography,
  useTheme,
  IconButton,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Tooltip from "@mui/material/Tooltip";
import { useCallback, useMemo, useState } from "react";

import { useScheduleSessions } from "@/features/schedule/useScheduleSessions";
import type { Level, SessionDto } from "@/api/schedule.api";
import { useAuth } from "@/features/auth/useAuth";
import { useBookScheduleSession } from "@/features/schedule/useBookScheduleSession";
import ConfirmBookingModal from "@/components/schedule/ConformBookingModal";

type SessionStatus = "booked" | "full" | "available";

const START_HOUR = 16;
const END_HOUR = 22;
const SLOT_MIN = 30;

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

function minutesBetween(aIso: string, bIso: string) {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  return Math.max(0, Math.round((b - a) / 60000));
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function fmtDateTimeRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const day = new Intl.DateTimeFormat("pl-PL", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(start);

  const t1 = new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(start);
  const t2 = new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(end);

  return `${day} • ${t1}–${t2}`;
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

  const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);

  const slots = useMemo(() => {
    const out: Array<{ hour: number; minute: number }> = [];
    for (let h = START_HOUR; h < END_HOUR; h++) {
      out.push({ hour: h, minute: 0 });
      out.push({ hour: h, minute: 30 });
    }
    return out;
  }, []);

  const getStatusForSession = useCallback(
    (s: SessionDto): SessionStatus => {
      const isBooked =
        !!user && Array.isArray(s.participantsIds) && s.participantsIds.includes(user.id);

      if (isBooked) return "booked";
      if (s.reserved >= s.capacity) return "full";
      return "available";
    },
    [user]
  );

  const blocks = useMemo(() => {
    const sessions = data?.items ?? [];
    return sessions
      .map((s) => {
        const start = new Date(s.startAt);
        const end = new Date(s.endAt);

        const dayIndex = Math.floor((start.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000));
        if (dayIndex < 0 || dayIndex > 6) return null;

        const startMinOfDay = start.getHours() * 60 + start.getMinutes();
        const endMinOfDay = end.getHours() * 60 + end.getMinutes();

        const gridStartMin = START_HOUR * 60;
        const gridEndMin = END_HOUR * 60;

        const clampedStart = clamp(startMinOfDay, gridStartMin, gridEndMin);
        const clampedEnd = clamp(endMinOfDay, gridStartMin, gridEndMin);

        const duration = Math.max(0, clampedEnd - clampedStart);
        if (duration === 0) return null;

        const rowStart = 2 + Math.floor((clampedStart - gridStartMin) / SLOT_MIN);
        const rowSpan = Math.max(1, Math.ceil(duration / SLOT_MIN));
        const col = 2 + dayIndex;

        const status = getStatusForSession(s);

        return {
          session: s,
          col,
          rowStart,
          rowSpan,
          durationMin: minutesBetween(s.startAt, s.endAt),
          status,
        };
      })
      .filter(Boolean) as Array<{
      session: SessionDto;
      col: number;
      rowStart: number;
      rowSpan: number;
      durationMin: number;
      status: SessionStatus;
    }>;
  }, [data?.items, weekStart, getStatusForSession]);

  const bookMut = useBookScheduleSession();

  const [okOpen, setOkOpen] = useState(false);
  const [errOpen, setErrOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSession, setPendingSession] = useState<SessionDto | null>(null);

  const cardBg = isDark ? theme.palette.background.paper : theme.palette.grey[100];
  const gridBorder = alpha(theme.palette.divider, 0.9);
  const headerBg = isDark ? alpha(theme.palette.common.white, 0.04) : alpha(theme.palette.grey[900], 0.02);

  function onTileClick(s: SessionDto) {
    const status = getStatusForSession(s);
    if (status !== "available") return;

    setPendingSession(s);
    setConfirmOpen(true);
  }

  async function confirmBooking() {
    if (!pendingSession) return;

    try {
      await bookMut.mutateAsync({ sessionId: pendingSession.id });
      setConfirmOpen(false);
      setPendingSession(null);
      setOkOpen(true);
    } catch (e: unknown) {
      let msg = "Nie udało się zapisać";
      if (typeof e === "object" && e !== null) {
        const maybeAxios = e as { response?: { data?: { message?: string } }; message?: string };
        msg = maybeAxios.response?.data?.message ?? maybeAxios.message ?? msg;
      }
      setErrMsg(msg);
      setErrOpen(true);
      setConfirmOpen(false);
      setPendingSession(null);
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, md: 2.5 },
        borderRadius: 3,
        backgroundColor: cardBg,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        maxWidth: 1400,
        mx: "auto",
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
        <Box sx={{ width: "100%", overflowX: "auto", overflowY: "auto", pb: 1, maxHeight: 620 }}>
          <Box
            sx={{
              minWidth: 1100,
              display: "grid",
              gridTemplateColumns: `88px repeat(7, 1fr)`,
              gridTemplateRows: `48px repeat(${slots.length}, 44px)`,
              border: `1px solid ${gridBorder}`,
              borderRadius: 2,
              overflow: "hidden",
              position: "relative",
            }}
          >
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

            {slots.map((t, idx) => {
              const showLabel = t.minute === 0;
              const row = 2 + idx;

              return (
                <Box key={`${t.hour}:${t.minute}`} sx={{ display: "contents" }}>
                  <Box
                    sx={{
                      gridColumn: 1,
                      gridRow: row,
                      borderTop: `1px solid ${gridBorder}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 0.5,
                      color: "text.secondary",
                      fontSize: 12,
                    }}
                  >
                    {showLabel ? (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                        <span>{String(t.hour).padStart(2, "0")}:00</span>
                      </Stack>
                    ) : (
                      <span style={{ opacity: 0.3 }}>{String(t.hour).padStart(2, "0")}:30</span>
                    )}
                  </Box>

                  {days.map((_, dayIndex) => (
                    <Box
                      key={`${dayIndex}-${idx}`}
                      sx={{
                        gridColumn: 2 + dayIndex,
                        gridRow: row,
                        borderTop: `1px solid ${gridBorder}`,
                        borderLeft: `1px solid ${gridBorder}`,
                        backgroundColor: idx % 2 === 1 ? alpha(theme.palette.action.hover, isDark ? 0.05 : 0.03) : "transparent",
                      }}
                    />
                  ))}
                </Box>
              );
            })}

            {blocks.map((b) => {
              const s = b.session;
              const reserved = s.reserved;
              const free = Math.max(0, s.capacity - reserved);

              const bg =
                b.status === "booked"
                  ? theme.palette.success.main
                  : b.status === "full"
                  ? theme.palette.error.main
                  : theme.palette.primary.main;

              const tooltip = (
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {s.name}
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block" }}>
                    {s.type} • {s.trainerName} • {levelLabel(s.level)}
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block" }}>
                    {fmtDateTimeRange(s.startAt, s.endAt)} • {b.durationMin} min
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                    Miejsca: {reserved}/{s.capacity} (wolne: {free})
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block" }}>
                    Status:{" "}
                    {b.status === "available"
                      ? "możesz się zapisać"
                      : b.status === "booked"
                      ? "zapisany"
                      : "brak miejsc"}
                  </Typography>
                </Box>
              );

              return (
                <Tooltip key={s.id} title={tooltip} arrow placement="top" enterDelay={150}>
                  <Box
                    onClick={() => onTileClick(s)}
                    sx={{
                      gridColumn: b.col,
                      gridRow: `${b.rowStart} / span ${b.rowSpan}`,
                      zIndex: 2,
                      m: 0.5,
                      borderRadius: 2,
                      p: 1,
                      cursor: b.status === "available" ? "pointer" : "default",
                      backgroundColor: alpha(bg, isDark ? 0.18 : 0.10),
                      border: `1px solid ${alpha(bg, 0.55)}`,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 0.5,
                      overflow: "hidden",
                      "&:hover":
                        b.status === "available"
                          ? { backgroundColor: alpha(bg, isDark ? 0.24 : 0.14) }
                          : undefined,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        lineHeight: 1.2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={s.name}
                    >
                      {s.name}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {reserved}/{s.capacity} (wolne: {free})
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      )}

      <ConfirmBookingModal
        open={confirmOpen}
        sessionName={pendingSession?.name ?? ""}
        loading={bookMut.isPending}
        onClose={() => {
          if (bookMut.isPending) return;
          setConfirmOpen(false);
          setPendingSession(null);
        }}
        onConfirm={confirmBooking}
      />

      <Snackbar open={okOpen} autoHideDuration={3500} onClose={() => setOkOpen(false)}>
        <Alert onClose={() => setOkOpen(false)} severity="success" variant="filled">
          Zapisano na zajęcia.
        </Alert>
      </Snackbar>

      <Snackbar open={errOpen} autoHideDuration={4500} onClose={() => setErrOpen(false)}>
        <Alert onClose={() => setErrOpen(false)} severity="error" variant="filled">
          {errMsg}
        </Alert>
      </Snackbar>
    </Paper>
  );
};
