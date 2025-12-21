import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";
import type { Level, SessionType } from "@/api/schedule.api";
import { useScheduleSessions } from "@/features/schedule/useScheduleSessions";
import { useCreateScheduleSession } from "@/features/schedule/useCreateScheduleSession";
import { useOfferTemplates } from "@/features/offer/useOfferTemplates";
import type { OfferTemplateItem } from "@/types/offerTemplates";


const START_HOUR = 16;
const END_HOUR = 22;

const SLOTS: Array<{ hour: number; minute: number }> = Array.from(
  { length: (END_HOUR - START_HOUR) * 2 },
  (_, i) => {
    const totalMin = START_HOUR * 60 + i * 30;
    return { hour: Math.floor(totalMin / 60), minute: totalMin % 60 };
  },
);

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
  const b = new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit" }).format(
    addDays(toExclusive, -1),
  );
  return `${a} – ${b}`;
}

function isSlotBlockedByAnySession(
  sessions: Array<{ startAt: string; endAt: string }>,
  slotStart: Date,
) {
  const slotEnd = new Date(slotStart);
  slotEnd.setTime(slotStart.getTime() + 30 * 60 * 1000);

  return sessions.some((s) => {
    const a = new Date(s.startAt).getTime();
    const b = new Date(s.endAt).getTime();
    return a < slotEnd.getTime() && b > slotStart.getTime();
  });
}

function computeEndFromDuration(startHour: number, startMinute: number, durationMin: number) {
  const total = startHour * 60 + startMinute + durationMin;
  const endHour = Math.floor(total / 60);
  const endMinute = total % 60;
  return { endHour, endMinute };
}

function hasErrorMessage(e: unknown): e is { message?: string } {
  return typeof e === "object" && e !== null && "message" in e;
}

function hasResponseMessage(e: unknown): e is { response?: { data?: { message?: string } } } {
  return (
    typeof e === "object" &&
    e !== null &&
    "response" in e &&
    typeof (e as { response?: unknown }).response === "object"
  );
}

export default function TrainerCreateSessions() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const base = startOfWeekMonday(new Date());
    return addDays(base, weekOffset * 7);
  }, [weekOffset]);

  const weekEndExclusive = useMemo(() => addDays(weekStart, 7), [weekStart]);

  const fromIso = useMemo(() => weekStart.toISOString(), [weekStart]);
  const toIso = useMemo(() => weekEndExclusive.toISOString(), [weekEndExclusive]);

  const { data, isLoading, isError, refetch } = useScheduleSessions(fromIso, toIso);
  const sessions = data?.items ?? [];

  const days = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
    [weekStart],
  );


  const [selected, setSelected] = useState<{
    dayIndex: number;
    hour: number;
    minute: number;
  } | null>(null);


  const [name, setName] = useState("");
  const [type, setType] = useState<SessionType>("MMA");
  const [level, setLevel] = useState<Level>("beginner");
  const [capacity, setCapacity] = useState<number>(12);
  const [durationMin, setDurationMin] = useState<number>(60);

  const createMut = useCreateScheduleSession();

  const [okOpen, setOkOpen] = useState(false);
  const [errOpen, setErrOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const cardBg = isDark ? theme.palette.background.paper : theme.palette.grey[100];
  const gridBorder = alpha(theme.palette.divider, 0.9);
  const headerBg = isDark
    ? alpha(theme.palette.common.white, 0.04)
    : alpha(theme.palette.grey[900], 0.02);

  function getSessionsForSlot(dayIndex: number, hour: number, minute: number) {
    const day = days[dayIndex];
    return sessions.filter((s) => {
      const start = new Date(s.startAt);
      return (
        start.getFullYear() === day.getFullYear() &&
        start.getMonth() === day.getMonth() &&
        start.getDate() === day.getDate() &&
        start.getHours() === hour &&
        start.getMinutes() === minute
      );
    });
  }

  const templatesQ = useOfferTemplates();
  const templates = templatesQ.data?.items ?? [];

  const [templateId, setTemplateId] = useState<string>("");

  function applyTemplate(t: OfferTemplateItem) {
    setName(t.name);
    setType(t.type);
    setLevel(t.level);
    setCapacity(t.defaultCapacity);
    setDurationMin(t.durationMin);
  }

  async function submit() {
    if (!selected) {
      setErrMsg("Najpierw wybierz slot w grafiku.");
      setErrOpen(true);
      return;
    }
    if (!name.trim()) {
      setErrMsg("Podaj nazwę zajęć.");
      setErrOpen(true);
      return;
    }
    if (!Number.isFinite(capacity) || capacity < 1) {
      setErrMsg("Nieprawidłowa liczba miejsc.");
      setErrOpen(true);
      return;
    }
    if (!Number.isFinite(durationMin) || durationMin < 30 || durationMin > 240) {
      setErrMsg("Czas trwania musi być w zakresie 30–240 min.");
      setErrOpen(true);
      return;
    }

    const weekday = selected.dayIndex + 1;
    const startHour = selected.hour;
    const startMinute = selected.minute;

    const { endHour, endMinute } = computeEndFromDuration(startHour, startMinute, durationMin);

    if (endHour > 23 || (endHour === 23 && endMinute > 59)) {
      setErrMsg("Zajęcia nie mogą kończyć się po północy (wybierz krótszy czas).");
      setErrOpen(true);
      return;
    }

    try {
      await createMut.mutateAsync({
        name: name.trim(),
        type,
        level,
        capacity,
        weekStart: weekStart.toISOString(),
        weekday,
        startHour,
        startMinute,
        endHour,
        endMinute,
      });

      setOkOpen(true);
      setName("");
      setDurationMin(60);
      setSelected(null);
      refetch();
    } catch (e: unknown) {
      let msg = "Nie udało się utworzyć zajęć";

      if (hasResponseMessage(e)) {
        msg =
          (e as { response?: { data?: { message?: string } } }).response?.data?.message ??
          msg;
      } else if (hasErrorMessage(e) && typeof e.message === "string") {
        msg = e.message;
      }

      setErrMsg(msg);
      setErrOpen(true);
    }
  }

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2.5,
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, md: 2.5 },
          borderRadius: 3,
          backgroundColor: cardBg,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box>
            <Typography variant="h6">Dodawanie zajęć</Typography>
            <Typography variant="body2" color="text.secondary">
              Najpierw kliknij slot w grafiku, potem uzupełnij formularz.
            </Typography>
          </Box>

          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton size="small" onClick={() => setWeekOffset((v) => v - 1)}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              Tydzień: {fmtRange(weekStart, weekEndExclusive)}
            </Typography>
            <IconButton size="small" onClick={() => setWeekOffset((v) => v + 1)}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "420px 1fr" },
          gap: 2.5,
          alignItems: "start",
        }}
      >

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            backgroundColor: cardBg,
            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Formularz
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Wybrany termin:{" "}
            <strong>
              {selected
                ? `${fmtDayShort(days[selected.dayIndex])}, ${selected.hour}:${
                    selected.minute === 0 ? "00" : "30"
                  }`
                : "—"}
            </strong>
          </Typography>

          <Stack spacing={2}>

            <FormControl fullWidth>
            <InputLabel id="template-label">Szablon (opcjonalnie)</InputLabel>
            <Select
              labelId="template-label"
              label="Szablon (opcjonalnie)"
              value={templateId}
              onChange={(e) => {
                const id = e.target.value as string;
                setTemplateId(id);

                const t = templates.find((x) => x.id === id);
                if (t) applyTemplate(t);
              }}
            >
              <MenuItem value="">—</MenuItem>

              {templates.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name} ({t.type}/{t.level}, {t.durationMin} min, cap {t.defaultCapacity})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {templatesQ.isError && (
            <Typography color="error" variant="body2">
              Nie udało się pobrać szablonów oferty.
            </Typography>
          )}
            <TextField
              label="Nazwa zajęć"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="type-label">Typ</InputLabel>
              <Select
                labelId="type-label"
                label="Typ"
                value={type}
                onChange={(e) => setType(e.target.value as SessionType)}
              >
                <MenuItem value="BJJ">BJJ</MenuItem>
                <MenuItem value="MMA">MMA</MenuItem>
                <MenuItem value="Cross">Cross</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="level-label">Poziom</InputLabel>
              <Select
                labelId="level-label"
                label="Poziom"
                value={level}
                onChange={(e) => setLevel(e.target.value as Level)}
              >
                <MenuItem value="beginner">Początkujący</MenuItem>
                <MenuItem value="intermediate">Średniozaaw.</MenuItem>
                <MenuItem value="advanced">Zaawansowany</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Liczba miejsc"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              inputProps={{ min: 1, max: 200 }}
              fullWidth
            />

            <TextField
              label="Czas trwania (min)"
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              inputProps={{ min: 30, max: 240, step: 30 }}
              helperText="Może być > 60 min (np. 90, 120)"
              fullWidth
            />

            <Button variant="contained" size="large" onClick={submit} disabled={createMut.isPending}>
              {createMut.isPending ? "Dodawanie..." : "Dodaj zajęcia"}
            </Button>
          </Stack>
        </Paper>

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
            <Typography variant="h6">Grafik (kliknij wolny slot)</Typography>

            <Box sx={{ ml: "auto" }}>
              <Button size="small" variant="outlined" onClick={() => refetch()} disabled={isLoading}>
                Odśwież
              </Button>
            </Box>
          </Box>

          {isLoading && (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={28} />
            </Box>
          )}

          {isError && (
            <Typography color="error" variant="body2">
              Nie udało się pobrać grafiku.
            </Typography>
          )}

          {!isLoading && !isError && (
            <Box sx={{ width: "100%", overflowX: "auto", overflowY: "auto", pb: 1, maxHeight: 520 }}>
              <Box
                sx={{
                  minWidth: 900,
                  display: "grid",
                  gridTemplateColumns: `72px repeat(7, 1fr)`,
                  gridAutoRows: "minmax(44px, auto)",
                  border: `1px solid ${gridBorder}`,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
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

                {SLOTS.map(({ hour, minute }) => (
                  <Box key={`${hour}:${minute}`} sx={{ display: "contents" }}>
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
                      {hour}:{minute === 0 ? "00" : "30"}
                    </Box>

                    {days.map((day, dayIndex) => {
                      const slotStart = new Date(day);
                      slotStart.setHours(hour, minute, 0, 0);

                      const blocked = isSlotBlockedByAnySession(sessions, slotStart);
                      const isSelected =
                        !!selected &&
                        selected.dayIndex === dayIndex &&
                        selected.hour === hour &&
                        selected.minute === minute;

                      const slotSessions = getSessionsForSlot(dayIndex, hour, minute);

                      return (
                        <Box
                          key={`${dayIndex}-${hour}-${minute}`}
                          onClick={() => {
                            if (!blocked) setSelected({ dayIndex, hour, minute });
                          }}
                          sx={{
                            borderTop: `1px solid ${gridBorder}`,
                            borderLeft: `1px solid ${gridBorder}`,
                            p: 0.75,
                            minHeight: 44,
                            cursor: blocked ? "not-allowed" : "pointer",
                            backgroundColor: isSelected
                              ? alpha(theme.palette.primary.main, isDark ? 0.22 : 0.14)
                              : blocked
                                ? alpha(theme.palette.action.disabledBackground, isDark ? 0.18 : 0.35)
                                : "transparent",
                            "&:hover": blocked
                              ? undefined
                              : {
                                  backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1),
                                },
                          }}
                        >
                          {slotSessions.map((s) => (
                            <Box key={s.id} sx={{ mb: 0.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                {s.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {s.type} • {s.trainerName}
                              </Typography>
                            </Box>
                          ))}

                          {!slotSessions.length && blocked && (
                            <Typography variant="caption" color="text.secondary">
                              Zajęte
                            </Typography>
                          )}

                          {!slotSessions.length && !blocked && (
                            <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                              Wolne
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      <Snackbar open={okOpen} autoHideDuration={3500} onClose={() => setOkOpen(false)}>
        <Alert onClose={() => setOkOpen(false)} severity="success" variant="filled">
          Zajęcia dodane.
        </Alert>
      </Snackbar>

      <Snackbar open={errOpen} autoHideDuration={4500} onClose={() => setErrOpen(false)}>
        <Alert onClose={() => setErrOpen(false)} severity="error" variant="filled">
          {errMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
