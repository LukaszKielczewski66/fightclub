import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { useAdminTrainersOverview } from "@/features/admin/useAdminTrainersOverview";
import { TrainersOverviewParams } from "@/types/adminTrainers";
import { getErrorMessage } from "./helpers/getErrorMessage";

function fmtRange(fromIso: string, toIso: string) {
  const f = new Date(fromIso);
  const t = new Date(toIso);
  const df = new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit" }).format(f);
  const dt = new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit" }).format(t);
  return `${df} – ${dt}`;
}

function useDebounced(v: string, ms = 350) {
  const [x, setX] = useState(v);
  useMemo(() => {
    const t = setTimeout(() => setX(v), ms);
    return () => clearTimeout(t);
  }, [v, ms]);
  return x;
}

export const AdminTrainers = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const cardBg = isDark ? theme.palette.background.paper : theme.palette.grey[200];

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 350);

  const [active, setActive] = useState<"all" | "true" | "false">("all");
  const [sort, setSort] = useState<TrainersOverviewParams["sort"]>("week.hours:desc");

  const params: TrainersOverviewParams = {
    query: debouncedQuery.trim() ? debouncedQuery.trim() : undefined,
    active: active === "all" ? undefined : active === "true",
    sort,
  };

  const q = useAdminTrainersOverview(params);

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
      <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
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
    <Box minHeight="100vh" width="100%" py={{ xs: 4, md: 6 }} sx={{ backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="lg" sx={{ display: "grid", gap: { xs: 3, md: 4 } }}>
        <Stack spacing={1}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Trenerzy
          </Typography>
          {q.data?.range ? (
            <Typography variant="body2" color="text.secondary">
              Zakres tygodnia: {fmtRange(q.data.range.from, q.data.range.to)}
            </Typography>
          ) : null}
        </Stack>
        <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, backgroundColor: cardBg }} elevation={0}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" },
              gap: 2,
              alignItems: "end",
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                Szukaj
              </Typography>
              <TextField
                placeholder="Imię lub email"
                size="small"
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Box>

            <FormControl size="small" fullWidth>
              <InputLabel id="active-label">Aktywność</InputLabel>
              <Select
                labelId="active-label"
                label="Aktywność"
                value={active}
                onChange={(e) =>
                    setActive(e.target.value as "all" | "true" | "false")
                }
              >
                <MenuItem value="all">Wszyscy</MenuItem>
                <MenuItem value="true">Aktywni</MenuItem>
                <MenuItem value="false">Nieaktywni</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel id="sort-label">Sortowanie</InputLabel>
              <Select
                labelId="sort-label"
                label="Sortowanie"
                value={sort}
                onChange={(e) =>
                    setSort(e.target.value as TrainersOverviewParams["sort"])
                    }
              >
                <MenuItem value="week.hours:desc">Tydzień: godziny ↓</MenuItem>
                <MenuItem value="week.hours:asc">Tydzień: godziny ↑</MenuItem>
                <MenuItem value="week.fillRate:desc">Tydzień: obłożenie ↓</MenuItem>
                <MenuItem value="name:asc">Imię A–Z</MenuItem>
                <MenuItem value="name:desc">Imię Z–A</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {q.isLoading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : null}

        {q.isError ? (
          <Alert severity="error">
            {getErrorMessage(q.error, "Nie udało się pobrać trenerów")}
          </Alert>
        ) : null}

        {q.data ? (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
                gap: 2,
              }}
            >
              <Card label="Trenerzy" value={`${q.data.kpis.trainersTotal}`} hint={`aktywni: ${q.data.kpis.trainersActive}`} />
              <Card label="Zajęcia (tydzień)" value={`${q.data.kpis.sessionsThisWeek}`} />
              <Card label="Średnie obłożenie (tydzień)" value={`${q.data.kpis.avgFillRate}%`} />
              <Card label="Przekroczony limit" value={`${q.data.kpis.overLimitCount}`} />
            </Box>

            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, backgroundColor: cardBg }} elevation={0}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Lista trenerów
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Tydzień: zajęcia / godziny / obłożenie + Last30.
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "grid", gap: 1.25 }}>
                {q.data.items.map((t) => (
                  <Paper
                    key={t.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      backgroundColor: isDark ? theme.palette.background.default : theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                    }}
                  >
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                            {t.name}
                          </Typography>
                          <Chip size="small" label={t.active ? "Aktywny" : "Nieaktywny"} />
                          {t.week.overLimit ? <Chip size="small" color="warning" label="Over limit" /> : null}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {t.email}
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                          {(t.specializations ?? []).map((s) => (
                            <Chip key={s} size="small" label={s} variant="outlined" />
                          ))}
                          {(t.levelsTaught ?? []).map((l) => (
                            <Chip key={l} size="small" label={l} variant="outlined" />
                          ))}
                          {t.maxWeeklyHours != null ? (
                            <Chip size="small" label={`limit: ${t.maxWeeklyHours}h`} />
                          ) : (
                            <Chip size="small" label="limit: —" />
                          )}
                        </Stack>
                      </Box>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, auto)" },
                          gap: 1.5,
                          justifyContent: { md: "end" },
                        }}
                      >
                        <Chip label={`Tydz: ${t.week.sessionsCount} zaj.`} />
                        <Chip label={`Godz: ${t.week.hours}h`} />
                        <Chip label={`Obł: ${t.week.fillRate}%`} />
                        <Chip label={`Last30: ${t.last30.fillRate}%`} variant="outlined" />
                      </Box>
                    </Stack>
                  </Paper>
                ))}

                {q.data.items.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Brak trenerów spełniających kryteria.
                  </Typography>
                ) : null}
              </Box>
            </Paper>
          </>
        ) : null}
      </Container>
    </Box>
  );
};
