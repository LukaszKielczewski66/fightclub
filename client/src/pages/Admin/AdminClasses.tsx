import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useMemo, useState } from "react";
import type { ClassTemplateItem, OfferLevel, OfferType } from "@/types/adminClasses";
import { useAdminClassTemplates } from "@/features/admin/useAdminClassTemplates";
import { useCreateClassTemplate, useUpdateClassTemplate } from "@/features/admin/useAdminClassTemplatesMutations";

type ActiveFilter = "all" | "true" | "false";
type Sort = "createdAt:desc" | "createdAt:asc" | "name:asc" | "name:desc";

function getErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === "object" && "message" in err) {
    const e = err as { message?: unknown };
    if (typeof e.message === "string") return e.message;
  }
  return fallback;
}

function useDebouncedValue(value: string, delayMs = 350) {
  const [debounced, setDebounced] = useState(value);

  useMemo(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

const TYPES: OfferType[] = ["MMA", "BJJ", "Cross"];
const LEVELS: OfferLevel[] = ["beginner", "intermediate", "advanced"];

export const AdminClasses = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 350);

  const [type, setType] = useState<OfferType | "all">("all");
  const [active, setActive] = useState<ActiveFilter>("all");
  const [sort, setSort] = useState<Sort>("createdAt:desc");

  const params = useMemo(() => {
    return {
      query: debouncedQuery.trim() ? debouncedQuery.trim() : undefined,
      type: type === "all" ? undefined : type,
      active: active === "all" ? undefined : active === "true",
      sort,
    };
  }, [debouncedQuery, type, active, sort]);

  const q = useAdminClassTemplates(params);
  const items = q.data?.items ?? [];

  const createMut = useCreateClassTemplate();
  const [name, setName] = useState("");
  const [newType, setNewType] = useState<OfferType>("MMA");
  const [newLevel, setNewLevel] = useState<OfferLevel>("beginner");
  const [durationMin, setDurationMin] = useState<number>(60);
  const [defaultCapacity, setDefaultCapacity] = useState<number>(12);

  const [okOpen, setOkOpen] = useState(false);
  const [errOpen, setErrOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  async function handleCreate() {
    setErrMsg("");

    try {
      await createMut.mutateAsync({
        name,
        type: newType,
        level: newLevel,
        durationMin,
        defaultCapacity,
      });
      setName("");
      setNewType("MMA");
      setNewLevel("beginner");
      setDurationMin(60);
      setDefaultCapacity(12);
      setOkOpen(true);
    } catch (e: unknown) {
      setErrMsg(getErrorMessage(e, "Nie udało się dodać szablonu"));
      setErrOpen(true);
    }
  }

  const updateMut = useUpdateClassTemplate();
  const [editing, setEditing] = useState<ClassTemplateItem | null>(null);

  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<OfferType>("MMA");
  const [editLevel, setEditLevel] = useState<OfferLevel>("beginner");
  const [editDurationMin, setEditDurationMin] = useState<number>(60);
  const [editDefaultCapacity, setEditDefaultCapacity] = useState<number>(12);
  const [editActive, setEditActive] = useState(true);

  function openEdit(x: ClassTemplateItem) {
    setEditing(x);
    setEditName(x.name);
    setEditType(x.type);
    setEditLevel(x.level);
    setEditDurationMin(x.durationMin);
    setEditDefaultCapacity(x.defaultCapacity);
    setEditActive(x.active);
  }

  function closeEdit() {
    setEditing(null);
  }

  async function handleSaveEdit() {
    if (!editing) return;

    try {
      await updateMut.mutateAsync({
        id: editing.id,
        payload: {
          name: editName,
          type: editType,
          level: editLevel,
          durationMin: editDurationMin,
          defaultCapacity: editDefaultCapacity,
          active: editActive,
        },
      });
      setOkOpen(true);
      closeEdit();
    } catch (e: unknown) {
      setErrMsg(getErrorMessage(e, "Nie udało się zapisać zmian"));
      setErrOpen(true);
    }
  }

  return (
    <Box minHeight="100vh" width="100%" py={{ xs: 4, md: 6 }} sx={{ backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="lg" sx={{ display: "grid", gap: { xs: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Oferta — szablony zajęć
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            backgroundColor: isDark ? theme.palette.background.paper : theme.palette.grey[200],
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
            Dodaj szablon
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr 1fr" },
              gap: 2,
              alignItems: "end",
            }}
          >
            <TextField label="Nazwa" value={name} onChange={(e) => setName(e.target.value)} size="small" />

            <FormControl size="small" fullWidth>
              <InputLabel id="new-type">Typ</InputLabel>
              <Select
                labelId="new-type"
                label="Typ"
                value={newType}
                onChange={(e) => setNewType(e.target.value as OfferType)}
              >
                {TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel id="new-level">Poziom</InputLabel>
              <Select
                labelId="new-level"
                label="Poziom"
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value as OfferLevel)}
              >
                {LEVELS.map((l) => (
                  <MenuItem key={l} value={l}>
                    {l}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Czas (min)"
              type="number"
              size="small"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              inputProps={{ min: 15, max: 240 }}
            />

            <TextField
              label="Pojemność"
              type="number"
              size="small"
              value={defaultCapacity}
              onChange={(e) => setDefaultCapacity(Number(e.target.value))}
              inputProps={{ min: 1, max: 200 }}
            />

            <Box sx={{ gridColumn: { xs: "1 / -1" } }}>
              <Button variant="contained" onClick={handleCreate} disabled={createMut.isPending}>
                Dodaj
              </Button>
            </Box>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            backgroundColor: isDark ? theme.palette.background.paper : theme.palette.grey[200],
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Lista szablonów
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Te szablony możesz potem użyć jako „preset” w grafiku.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr" },
              gap: 2,
              alignItems: "end",
              mb: 2,
            }}
          >
            <TextField
              label="Szukaj"
              placeholder="np. MMA Sparring"
              size="small"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <FormControl size="small" fullWidth>
              <InputLabel id="filter-type">Typ</InputLabel>
              <Select
                labelId="filter-type"
                label="Typ"
                value={type}
                onChange={(e) => setType(e.target.value as OfferType | "all")}
              >
                <MenuItem value="all">Wszystkie</MenuItem>
                {TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel id="filter-active">Aktywność</InputLabel>
              <Select
                labelId="filter-active"
                label="Aktywność"
                value={active}
                onChange={(e) => setActive(e.target.value as ActiveFilter)}
              >
                <MenuItem value="all">Wszystkie</MenuItem>
                <MenuItem value="true">Aktywne</MenuItem>
                <MenuItem value="false">Nieaktywne</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel id="filter-sort">Sort</InputLabel>
              <Select
                labelId="filter-sort"
                label="Sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
              >
                <MenuItem value="createdAt:desc">Najnowsze</MenuItem>
                <MenuItem value="createdAt:asc">Najstarsze</MenuItem>
                <MenuItem value="name:asc">Nazwa A–Z</MenuItem>
                <MenuItem value="name:desc">Nazwa Z–A</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {q.isError ? <Alert severity="error">{getErrorMessage(q.error, "Nie udało się pobrać oferty")}</Alert> : null}

          {items.length === 0 && !q.isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Brak szablonów.
            </Typography>
          ) : null}

          <Stack spacing={1.25}>
            {items.map((x) => (
              <Paper
                key={x.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: isDark ? theme.palette.background.default : theme.palette.background.paper,
                }}
              >
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography sx={{ fontWeight: 900 }}>{x.name}</Typography>
                      <Chip size="small" label={`${x.type}/${x.level}`} />
                      <Chip size="small" variant="outlined" label={`${x.durationMin} min`} />
                      <Chip size="small" variant="outlined" label={`cap: ${x.defaultCapacity}`} />
                      <Chip size="small" label={x.active ? "Aktywny" : "Nieaktywny"} />
                    </Stack>
                  </Box>

                  <Button variant="outlined" onClick={() => openEdit(x)}>
                    Edytuj
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>

        <Dialog open={!!editing} onClose={closeEdit} fullWidth maxWidth="sm">
          <DialogTitle>Edytuj szablon</DialogTitle>
          <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
            <TextField label="Nazwa" value={editName} onChange={(e) => setEditName(e.target.value)} size="small" />

            <FormControl size="small" fullWidth>
              <InputLabel id="edit-type">Typ</InputLabel>
              <Select
                labelId="edit-type"
                label="Typ"
                value={editType}
                onChange={(e) => setEditType(e.target.value as OfferType)}
              >
                {TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel id="edit-level">Poziom</InputLabel>
              <Select
                labelId="edit-level"
                label="Poziom"
                value={editLevel}
                onChange={(e) => setEditLevel(e.target.value as OfferLevel)}
              >
                {LEVELS.map((l) => (
                  <MenuItem key={l} value={l}>
                    {l}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Czas (min)"
              type="number"
              size="small"
              value={editDurationMin}
              onChange={(e) => setEditDurationMin(Number(e.target.value))}
              inputProps={{ min: 15, max: 240 }}
            />

            <TextField
              label="Pojemność"
              type="number"
              size="small"
              value={editDefaultCapacity}
              onChange={(e) => setEditDefaultCapacity(Number(e.target.value))}
              inputProps={{ min: 1, max: 200 }}
            />

            <Stack direction="row" spacing={1} alignItems="center">
              <Switch checked={editActive} onChange={(e) => setEditActive(e.target.checked)} />
              <Typography>Aktywny</Typography>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeEdit}>Anuluj</Button>
            <Button variant="contained" onClick={handleSaveEdit} disabled={updateMut.isPending}>
              Zapisz
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={okOpen} autoHideDuration={3500} onClose={() => setOkOpen(false)}>
          <Alert severity="success" variant="filled">
            Zapisano.
          </Alert>
        </Snackbar>

        <Snackbar open={errOpen} autoHideDuration={5000} onClose={() => setErrOpen(false)}>
          <Alert severity="error" variant="filled">
            {errMsg || "Wystąpił błąd"}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};
