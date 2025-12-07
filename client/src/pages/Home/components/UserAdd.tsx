import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { alpha } from "@mui/material/styles";
import { FormEvent, useState } from "react";
import { roleOptions } from "../helpers/roles";
import { useCreateUser } from "@/features/admin/useCreateUser";
import { isAxiosError } from "axios";
import { Role } from "@/types/adminUsers";

export default function UserAdd() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const cardBg = isDark
    ? theme.palette.background.paper
    : theme.palette.grey[100];
  const fieldBg = isDark
    ? alpha(theme.palette.common.white, 0.02)
    : alpha(theme.palette.common.black, 0.02);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>(
    roleOptions[0]?.value ?? "user"
  );

  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutateAsync, isPending } = useCreateUser();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  setErr(null);
  setSuccess(null);
  setErrorMsg("");

  try {
    await mutateAsync({
      email,
      name,
      password,
      role: role as Role,
    });
    setSuccessOpen(true);

    setEmail("");
    setName("");
    setPassword("");
    setRole("client");
  } catch (error: unknown) {

    if (isAxiosError(error)) {
      const msg = error.response?.data?.message ?? "Błąd podczas tworzenia użytkownika";
      setErrorMsg(msg);
      setErrorOpen(true);
    } else if (error instanceof Error) {
      setErrorMsg(error.message);
      setErrorOpen(true);
    } else {
      setErrorMsg("Nieznany błąd");
      setErrorOpen(true);
    }
  }
}

  const handleRoleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value as string);
  };

  return (
    <Accordion
      disableGutters
      sx={{
        width: "100%",
        borderRadius: 3,
        overflow: "hidden",
        backgroundColor: cardBg,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          "& .MuiAccordionSummary-content": { alignItems: "center", gap: 2 },
          borderBottom: `1px solid ${theme.palette.divider}`,
          minHeight: 56,
          px: { xs: 2, md: 3 },
        }}
      >
        <Typography component="h2" variant="h6">
          Dodaj użytkownika
        </Typography>
      </AccordionSummary>

      <AccordionDetails
        sx={{ width: "100%", px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          display="grid"
          gap={2}
          sx={{ width: "100%" }}
        >
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nazwa@domena.com"
            required
            variant="outlined"
            size="medium"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: fieldBg,
                borderRadius: 2,
                "& fieldset": {
                  borderColor: alpha(theme.palette.divider, 0.8),
                },
                "&:hover fieldset": { borderColor: theme.palette.text.primary },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
            }}
            InputProps={{
              sx: {
                "& input::placeholder": {
                  color: theme.palette.text.disabled,
                },
              },
            }}
          />

          <TextField
            fullWidth
            label="Imię i nazwisko"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jan Kowalski"
            required
            variant="outlined"
            size="medium"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: fieldBg,
                borderRadius: 2,
                "& fieldset": {
                  borderColor: alpha(theme.palette.divider, 0.8),
                },
                "&:hover fieldset": { borderColor: theme.palette.text.primary },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
            }}
            InputProps={{
              sx: {
                "& input::placeholder": {
                  color: theme.palette.text.disabled,
                },
              },
            }}
          />

          <TextField
            fullWidth
            label="Hasło"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="min. 8 znaków"
            required
            variant="outlined"
            size="medium"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: fieldBg,
                borderRadius: 2,
                "& fieldset": {
                  borderColor: alpha(theme.palette.divider, 0.8),
                },
                "&:hover fieldset": { borderColor: theme.palette.text.primary },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
            }}
            InputProps={{
              sx: {
                "& input::placeholder": {
                  color: theme.palette.text.disabled,
                },
              },
            }}
          />

          <FormControl
            fullWidth
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: fieldBg,
                borderRadius: 2,
                "& fieldset": {
                  borderColor: alpha(theme.palette.divider, 0.8),
                },
                "&:hover fieldset": { borderColor: theme.palette.text.primary },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
            }}
          >
            <InputLabel id="role-label">Rola</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              value={role}
              label="Rola"
              onChange={handleRoleChange}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: "50vh",
                  },
                },
              }}
            >
              {roleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {err && (
            <Typography variant="body2" color="error">
              {err}
            </Typography>
          )}

          {success && (
            <Typography variant="body2" color="success.main">
              {success}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isPending}
            sx={{
              alignSelf: { xs: "stretch", sm: "start" },
              px: 4,
              py: 1.1,
              fontWeight: 600,
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            {isPending ? "Dodawanie..." : "Dodaj użytkownika"}
          </Button>
        </Box>
      </AccordionDetails>
      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }} // opcjonalnie
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Użytkownik został pomyślnie utworzony!
        </Alert>
      </Snackbar>

      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }} // opcjonalnie
      >
        <Alert
          onClose={() => setErrorOpen(false)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {errorMsg}
        </Alert>
      </Snackbar>
    </Accordion>
  );
}
