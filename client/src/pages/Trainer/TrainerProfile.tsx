import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
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
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";

import { useMyProfile } from "@/features/profile/useMyProfile";
import { useUpdateMyProfile } from "@/features/profile/useUpdateMyProfile";
import { useMySessions } from "@/features/schedule/useMySessions";
import type { TrainerLevel, TrainerSpecialization } from "@/types/userTypes";

const SPEC_OPTIONS: TrainerSpecialization[] = ["MMA", "BJJ", "Cross"];
const LEVEL_OPTIONS: TrainerLevel[] = ["beginner", "intermediate", "advanced"];

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

function hoursBetween(startIso: string, endIso: string) {
  const a = new Date(startIso).getTime();
  const b = new Date(endIso).getTime();
  return Math.max(0, (b - a) / 3600000);
}

function levelLabel(l: TrainerLevel) {
  if (l === "beginner") return "Początkujący";
  if (l === "intermediate") return "Średniozaaw.";
  return "Zaawansowany";
}

export default function TrainerProfile() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const cardBg = isDark ? theme.palette.background.paper : theme.palette.grey[100];

  const { data, isLoading, isError, refetch, isFetching } = useMyProfile();
  const updateMut = useUpdateMyProfile();

  const profile = data?.user;

  const weekStart = useMemo(() => startOfWeekMonday(new Date()), []);
  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart]);

  const { data: mySessionsData } = useMySessions(weekStart.toISOString(), weekEnd.toISOString());
  const usedHours = useMemo(() => {
    const items = mySessionsData?.items ?? [];
    const sum = items.reduce((acc, s) => acc + hoursBetween(s.startAt, s.endAt), 0);
    return Math.round(sum * 10) / 10;
  }, [mySessionsData?.items]);

  const [specializations, setSpecializations] = useState<TrainerSpecialization[]>([]);
  const [levelsTaught, setLevelsTaught] = useState<TrainerLevel[]>([]);
  const [maxWeeklyHours, setMaxWeeklyHours] = useState<number | "">("");

  const [okOpen, setOkOpen] = useState(false);
  const [errOpen, setErrOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!profile) return;
    setSpecializations(profile.specializations ?? []);
    setLevelsTaught(profile.levelsTaught ?? []);
    setMaxWeeklyHours(profile.maxWeeklyHours ?? "");
  }, [profile, profile?.id]);

  async function onSave() {
    try {
      await updateMut.mutateAsync({
        specializations,
        levelsTaught,
        maxWeeklyHours: maxWeeklyHours === "" ? null : Number(maxWeeklyHours),
      });
      setOkOpen(true);
    } catch (e: unknown) {
      const msg =
        isAxiosError(e) ? e.response?.data?.message ?? e.message : e instanceof Error ? e.message : "Błąd zapisu";
      setErrMsg(msg);
      setErrOpen(true);
    }
  }

  const weeklyHint = useMemo(() => {
    const limit = profile?.maxWeeklyHours ?? null;
    if (limit == null) return `Wykorzystanie w tym tygodniu: ${usedHours}h`;
    return `Wykorzystanie w tym tygodniu: ${usedHours}h / ${limit}h`;
  }, [profile?.maxWeeklyHours, usedHours]);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", display: "grid", gap: 2.5 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          backgroundColor: cardBg,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main", fontSize: 28 }}>
            {(profile?.name?.[0] ?? "T").toUpperCase()}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              {profile?.name ?? "Profil trenera"}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {profile?.email ?? ""}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 700 }} color="primary.main">
              Trener
            </Typography>
          </Box>

          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Odśwież
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={onSave}
              disabled={updateMut.isPending || !profile}
            >
              Zapisz
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          backgroundColor: cardBg,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        }}
      >
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2 }}>
            <Typography variant="h6">Ustawienia trenera</Typography>
            <Typography variant="body2" color="text.secondary">
              {weeklyHint}
            </Typography>
          </Box>

          {isLoading && (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={28} />
            </Box>
          )}

          {isError && (
            <Typography color="error" variant="body2">
              Nie udało się pobrać profilu.
            </Typography>
          )}

          {!isLoading && !isError && profile && (
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="spec-label">Specjalizacje</InputLabel>
                <Select
                  labelId="spec-label"
                  label="Specjalizacje"
                  multiple
                  value={specializations}
                  onChange={(e) => setSpecializations(e.target.value as TrainerSpecialization[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                      {(selected as TrainerSpecialization[]).map((v) => (
                        <Chip key={v} label={v} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {SPEC_OPTIONS.map((v) => (
                    <MenuItem key={v} value={v}>
                      {v}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="lvl-label">Poziomy prowadzone</InputLabel>
                <Select
                  labelId="lvl-label"
                  label="Poziomy prowadzone"
                  multiple
                  value={levelsTaught}
                  onChange={(e) => setLevelsTaught(e.target.value as TrainerLevel[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                      {(selected as TrainerLevel[]).map((v) => (
                        <Chip key={v} label={levelLabel(v)} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {LEVEL_OPTIONS.map((v) => (
                    <MenuItem key={v} value={v}>
                      {levelLabel(v)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Max godzin tygodniowo"
                type="number"
                value={maxWeeklyHours}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") setMaxWeeklyHours("");
                  else setMaxWeeklyHours(Number(raw));
                }}
                inputProps={{ min: 0, max: 60, step: 1 }}
                helperText="Zakres 0–60"
                fullWidth
              />
            </Stack>
          )}
        </Stack>
      </Paper>

      <Snackbar open={okOpen} autoHideDuration={3000} onClose={() => setOkOpen(false)}>
        <Alert onClose={() => setOkOpen(false)} severity="success" variant="filled">
          Zapisano.
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
