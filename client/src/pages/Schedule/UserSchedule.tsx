import {
  Box,
  Paper,
  Typography,
  useTheme,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";

type Level = "beginner" | "intermediate" | "advanced";
type SessionStatus = "booked" | "full" | "available";

type MockSession = {
  id: string;
  name: string;
  type: "BJJ" | "MMA" | "Cross";
  trainer: string;
  day: number;
  startHour: number;
  endHour: number;
  level: Level;
  capacity: number;
  reserved: number;
  status: SessionStatus;
};

const DAYS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
const HOURS = [16, 17, 18, 19, 20, 21];

const MOCK_SESSIONS: MockSession[] = [
  {
    id: "1",
    name: "BJJ Beginners",
    type: "BJJ",
    trainer: "Jan Kowalski",
    day: 0,
    startHour: 18,
    endHour: 19,
    level: "beginner",
    capacity: 20,
    reserved: 18,
    status: "booked",
  },
  {
    id: "2",
    name: "MMA All Levels",
    type: "MMA",
    trainer: "Anna Nowak",
    day: 1,
    startHour: 19,
    endHour: 20,
    level: "intermediate",
    capacity: 15,
    reserved: 15,
    status: "full",
  },
  {
    id: "3",
    name: "Cross Training",
    type: "Cross",
    trainer: "Piotr Zieliński",
    day: 2,
    startHour: 18,
    endHour: 19,
    level: "beginner",
    capacity: 12,
    reserved: 7,
    status: "available",
  },
  {
    id: "4",
    name: "BJJ Advanced",
    type: "BJJ",
    trainer: "Michał Krawczyk",
    day: 4,
    startHour: 20,
    endHour: 21,
    level: "advanced",
    capacity: 10,
    reserved: 9,
    status: "available",
  },
  {
    id: "5",
    name: "MMA Sparring",
    type: "MMA",
    trainer: "Anna Nowak",
    day: 3,
    startHour: 19,
    endHour: 21,
    level: "advanced",
    capacity: 16,
    reserved: 16,
    status: "full",
  },
  {
    id: "6",
    name: "Weekend BJJ",
    type: "BJJ",
    trainer: "Jan Kowalski",
    day: 5,
    startHour: 17,
    endHour: 18,
    level: "beginner",
    capacity: 18,
    reserved: 10,
    status: "available",
  },
  {
    id: "7",
    name: "Niedzielne MMA",
    type: "MMA",
    trainer: "Anna Nowak",
    day: 6,
    startHour: 18,
    endHour: 19,
    level: "intermediate",
    capacity: 14,
    reserved: 12,
    status: "booked",
  },
];

function getSessionsForSlot(dayIndex: number, hour: number) {
  return MOCK_SESSIONS.filter(
    (s) => s.day === dayIndex && s.startHour === hour
  );
}

function dayHasAnySessions(dayIndex: number) {
  return MOCK_SESSIONS.some((s) => s.day === dayIndex);
}

function statusChip(status: SessionStatus) {
  switch (status) {
    case "booked":
      return (
        <Chip
          size="small"
          label="Zapisany"
          color="success"
          sx={{ height: 22, fontSize: 12 }}
        />
      );
    case "full":
      return (
        <Chip
          size="small"
          label="Brak miejsc"
          color="error"
          sx={{ height: 22, fontSize: 12 }}
        />
      );
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

  const cardBg = isDark ? theme.palette.background.paper : theme.palette.grey[100];
  const gridBorder = alpha(theme.palette.divider, 0.9);
  const headerBg = isDark
    ? alpha(theme.palette.common.white, 0.04)
    : alpha(theme.palette.grey[900], 0.02);

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
            Podgląd tygodnia – widoczne są tylko zajęcia dostępne dla użytkowników.
          </Typography>
        </Box>
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small">
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            Bieżący tydzień
          </Typography>
          <IconButton size="small">
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ mb: 2, flexWrap: "wrap" }}
      >
        <Typography variant="body2" color="text.secondary">
          Status:
        </Typography>
        {statusChip("booked")}
        {statusChip("available")}
        {statusChip("full")}
      </Stack>

      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          pb: 1,
        }}
      >
        <Box
          sx={{
            minWidth: 2000,
            display: "grid",
            gridTemplateColumns: `72px repeat(${DAYS.length}, 1fr)`,
            gridAutoRows: "minmax(56px, auto)",
            border: `1px solid ${gridBorder}`,
            borderRadius: 2,
            overflow: "hidden",
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

          {DAYS.map((day) => (
            <Box
              key={day}
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
              {day}
            </Box>
          ))}

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

              {DAYS.map((_, dayIndex) => {
                const sessions = getSessionsForSlot(dayIndex, hour);
                const hasAnySessionsThatDay = dayHasAnySessions(dayIndex);

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
                      {sessions.map((s) => {
                        const free = s.capacity - s.reserved;
                        return (
                          <Paper
                            key={s.id}
                            elevation={0}
                            sx={{
                              p: 0.75,
                              borderRadius: 1.5,
                              backgroundColor: alpha(
                                s.status === "booked"
                                  ? theme.palette.success.main
                                  : s.status === "full"
                                  ? theme.palette.error.main
                                  : theme.palette.primary.main,
                                isDark ? 0.18 : 0.1
                              ),
                              border: `1px solid ${alpha(
                                s.status === "booked"
                                  ? theme.palette.success.main
                                  : s.status === "full"
                                  ? theme.palette.error.main
                                  : theme.palette.primary.main,
                                0.6
                              )}`,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, lineHeight: 1.3 }}
                            >
                              {s.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              {s.type} • {s.trainer}
                            </Typography>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ mt: 0.25 }}
                            >
                              <Stack
                                direction="row"
                                spacing={0.75}
                                alignItems="center"
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {levelLabel(s.level)}
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  alignItems="center"
                                >
                                  <PeopleIcon
                                    sx={{ fontSize: 14, opacity: 0.7 }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {s.reserved}/{s.capacity}
                                    {free > 0 && ` (${free} wolne)`}
                                  </Typography>
                                </Stack>
                              </Stack>

                              {statusChip(s.status)}
                            </Stack>
                          </Paper>
                        );
                      })}

                      {hour === HOURS[0] && !hasAnySessionsThatDay && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ opacity: 0.7 }}
                        >
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
    </Paper>
  );
};
