import {
  Box,
  Paper,
  Typography,
  Avatar,
  Stack,
  useTheme,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useAuth } from "@/features/auth/useAuth";
import { useEffect, useMemo, useState } from "react";
import { useMyProfile } from "@/features/profile/useMyProfile";
import { useUpdateMyProfile } from "@/features/profile/useUpdateMyProfile";
import type { Gender, TrainingGoal } from "@/types/userTypes";

type Role = "admin" | "trainer" | "user";

const roleLabel: Record<Role, string> = {
  admin: "Administrator",
  trainer: "Trener",
  user: "Użytkownik klubu",
};

function genderLabel(g: Gender) {
  if (g === "male") return "Mężczyzna";
  if (g === "female") return "Kobieta";
  if (g === "other") return "Inna";
  return "Nie podaję";
}

const trainingGoalLabels: Record<TrainingGoal, string> = {
  lose_weight: "Redukcja wagi",
  build_muscle: "Budowa masy mięśniowej",
  improve_condition: "Poprawa kondycji",
  learn_self_defense: "Nauka samoobrony",
  competition_preparation: "Przygotowanie do zawodów",
  technique_improvement: "Doskonalenie techniki",
  rehabilitation: "Powrót po kontuzji",
  general_fitness: "Ogólna sprawność",
  stress_relief: "Redukcja stresu",
};

export default function HomeClient() {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const cardBg = isDark ? theme.palette.background.paper : theme.palette.grey[100];

  const { data, isLoading, isError } = useMyProfile();
  const updateMut = useUpdateMyProfile();

  const profile = data?.user;

  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<Gender | "">("");
  const [experienceMonths, setExperienceMonths] = useState<string>("");

  const [trainingGoal, setTrainingGoal] = useState<TrainingGoal | "">("");

  const [okOpen, setOkOpen] = useState(false);
  const [errOpen, setErrOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!profile) return;

    setAge(profile.age === null ? "" : String(profile.age));
    setGender(profile.gender ?? "");
    setExperienceMonths(profile.experienceMonths === null ? "" : String(profile.experienceMonths));
    setTrainingGoal(profile.trainingGoal ?? "");
  }, [profile]);

  const role = ((user?.role as Role) ?? "user") as Role;

  const headerName = useMemo(() => user?.name ?? profile?.name ?? "", [user?.name, profile?.name]);
  const headerEmail = useMemo(() => user?.email ?? profile?.email ?? "", [user?.email, profile?.email]);

  async function submit() {
    try {
      await updateMut.mutateAsync({
        age: age.trim() ? Number(age) : null,
        gender: gender ? (gender as Gender) : null,
        experienceMonths: experienceMonths.trim() ? Number(experienceMonths) : null,
        trainingGoal: trainingGoal ? (trainingGoal as TrainingGoal) : null,
      });

      setOkOpen(true);
      setErrOpen(false);
      setErrMsg("");
    } catch (e: unknown) {
      let msg = "Nie udało się zapisać danych";
      if (typeof e === "object" && e !== null) {
        const maybeAxios = e as { response?: { data?: { message?: string } }; message?: string };
        msg = maybeAxios.response?.data?.message ?? maybeAxios.message ?? msg;
      }
      setErrMsg(msg);
      setErrOpen(true);
    }
  }

  if (!user) return null;

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          backgroundColor: cardBg,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          maxWidth: 720,
          width: "100%",
        }}
      >
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2.5}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Avatar sx={{ width: 72, height: 72, bgcolor: "primary.main", fontSize: 32 }}>
              {headerName?.[0]?.toUpperCase() ?? "U"}
            </Avatar>

            <Box flex={1}>
              <Typography variant="h6" gutterBottom>
                {headerName}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {headerEmail}
              </Typography>

              <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }} color="primary.main">
                {roleLabel[role]}
              </Typography>
            </Box>
          </Stack>

          <Box>
            <Typography variant="h6" gutterBottom>
              Dane do raportów
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Te informacje są opcjonalne i pomogą później w generowaniu raportów/statystyk.
            </Typography>

            {isLoading && (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={26} />
              </Box>
            )}

            {isError && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                Nie udało się pobrać profilu. Spróbuj odświeżyć stronę.
              </Typography>
            )}

            <Stack spacing={2}>
              <TextField
                label="Wiek (opcjonalnie)"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                inputProps={{ min: 5, max: 120 }}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel id="gender-label">Płeć (opcjonalnie)</InputLabel>
                <Select
                  labelId="gender-label"
                  label="Płeć (opcjonalnie)"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender | "")}
                >
                  <MenuItem value="">—</MenuItem>
                  <MenuItem value="male">{genderLabel("male")}</MenuItem>
                  <MenuItem value="female">{genderLabel("female")}</MenuItem>
                  <MenuItem value="other">{genderLabel("other")}</MenuItem>
                  <MenuItem value="unknown">{genderLabel("unknown")}</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Staż treningowy (miesiące, opcjonalnie)"
                type="number"
                value={experienceMonths}
                onChange={(e) => setExperienceMonths(e.target.value)}
                inputProps={{ min: 0, max: 600 }}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel id="goal-label">Cel treningowy (opcjonalnie)</InputLabel>
                <Select
                  labelId="goal-label"
                  label="Cel treningowy (opcjonalnie)"
                  value={trainingGoal}
                  onChange={(e) => setTrainingGoal(e.target.value as TrainingGoal | "")}
                >
                  <MenuItem value="">—</MenuItem>
                  {(Object.keys(trainingGoalLabels) as TrainingGoal[]).map((key) => (
                    <MenuItem key={key} value={key}>
                      {trainingGoalLabels[key]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button variant="contained" onClick={submit} disabled={updateMut.isPending}>
                  {updateMut.isPending ? "Zapisywanie..." : "Zapisz"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Snackbar open={okOpen} autoHideDuration={3500} onClose={() => setOkOpen(false)}>
        <Alert onClose={() => setOkOpen(false)} severity="success" variant="filled">
          Zapisano dane profilu.
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
