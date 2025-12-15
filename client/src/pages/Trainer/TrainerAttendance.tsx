import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";

import { useTrainerAttendanceActive } from "@/features/attendance/useTrainerAttendanceActive";
import { useTrainerAttendancePast } from "@/features/attendance/useTrainerAttendancePast";
import { useTrainerAttendanceDetails } from "@/features/attendance/useTrainerAttendanceDetails";
import { useUpdateTrainerAttendance } from "@/features/attendance/useUpdateTrainerAttendance";
import { ActiveAttendanceItem, AttendanceStatus } from "@/types/attendance";

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit" }).format(d);
  const time = new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(d);
  const dow = new Intl.DateTimeFormat("pl-PL", { weekday: "short" }).format(d);
  return `${dow} ${day} • ${time}`;
}

function fmtTimeRange(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const t1 = new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(s);
  const t2 = new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(e);
  return `${t1}–${t2}`;
}

type LocalAttendanceState = Record<string, AttendanceStatus>;

export default function TrainerAttendance() {
  const activeQ = useTrainerAttendanceActive();
  const pastQ = useTrainerAttendancePast(80);

  const [expandedPastId, setExpandedPastId] = useState<string | null>(null);
  const pastDetailsQ = useTrainerAttendanceDetails(expandedPastId);

  const updateMut = useUpdateTrainerAttendance();

  const [okOpen, setOkOpen] = useState(false);
  const [errOpen, setErrOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [activeLocal, setActiveLocal] = useState<Record<string, LocalAttendanceState>>({});
  const [searchPast, setSearchPast] = useState("");

  useEffect(() => {
    const items = activeQ.data?.items ?? [];
    if (!items.length) return;

    setActiveLocal((prev) => {
      const next = { ...prev };
      for (const it of items) {
        const sid = it.session.id;
        const map: LocalAttendanceState = { ...(next[sid] ?? {}) };
        for (const p of it.participants) {
          if (!(p.id in map)) map[p.id] = p.status;
        }
        next[sid] = map;
      }
      return next;
    });
  }, [activeQ.data]);

  const activeItems: ActiveAttendanceItem[] = useMemo(() => activeQ.data?.items ?? [], [activeQ.data]);

  const pastItems = useMemo(() => {
    const items = pastQ.data?.items ?? [];
    const q = searchPast.trim().toLowerCase();
    if (!q) return items;
    return items.filter((s) => {
      const hay = `${s.name} ${s.type} ${s.level} ${s.startAt} ${s.endAt}`.toLowerCase();
      return hay.includes(q);
    });
  }, [pastQ.data, searchPast]);

  function toggleActive(sessionId: string, userId: string) {
    setActiveLocal((prev) => {
      const cur = prev[sessionId] ?? {};
      const nextStatus: AttendanceStatus = cur[userId] === "present" ? "absent" : "present";
      return { ...prev, [sessionId]: { ...cur, [userId]: nextStatus } };
    });
  }

  async function saveActive(sessionId: string, participants: Array<{ id: string }>) {
    try {
      const map = activeLocal[sessionId] ?? {};
      const updates = participants.map((p) => ({ userId: p.id, status: map[p.id] ?? "absent" }));
      await updateMut.mutateAsync({ sessionId, updates });
      setOkOpen(true);
    } catch (e: unknown) {
      let msg = "Nie udało się zapisać obecności";
      if (typeof e === "object" && e !== null) {
        const maybeAxios = e as { response?: { data?: { message?: string } }; message?: string };
        msg = maybeAxios.response?.data?.message ?? maybeAxios.message ?? msg;
      }
      setErrMsg(msg);
      setErrOpen(true);
    }
  }

  return (
    <Box sx={{ display: "grid", gap: 2.5, maxWidth: 1200, mx: "auto" }}>
      <Paper
        elevation={0}
        sx={(t) => ({
          p: { xs: 1.5, md: 2.25 },
          borderRadius: 3,
          border: `1px solid ${alpha(t.palette.divider, 0.85)}`,
          background:
            t.palette.mode === "dark"
              ? `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.18)}, ${alpha(
                  t.palette.background.paper,
                  0.9,
                )})`
              : `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.08)}, ${t.palette.background.paper})`,
        })}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.2 }}>
              Uczestnicy i frekwencja
            </Typography>
          </Box>

          <Box sx={{ ml: "auto" }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                activeQ.refetch();
                pastQ.refetch();
              }}
              disabled={activeQ.isFetching || pastQ.isFetching}
            >
              Odśwież
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={(t) => ({
          p: { xs: 1.5, md: 2.25 },
          borderRadius: 3,
          border: `1px solid ${alpha(t.palette.divider, 0.85)}`,
        })}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Trwające zajęcia
          </Typography>
        </Stack>

        {activeQ.isLoading && (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={28} />
          </Box>
        )}

        {activeQ.isError && (
          <Typography color="error" variant="body2">
            Nie udało się pobrać aktywnych zajęć.
          </Typography>
        )}

        {!activeQ.isLoading && !activeQ.isError && activeItems.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Brak zajęć w trakcie.
          </Typography>
        )}

        <Stack spacing={2}>
          {activeItems.map((it) => {
            const sid = it.session.id;
            const localMap = activeLocal[sid] ?? {};

            const presentCount = it.participants.reduce((acc, p) => {
              const st = localMap[p.id] ?? p.status;
              return acc + (st === "present" ? 1 : 0);
            }, 0);

            return (
              <Paper
                key={sid}
                elevation={0}
                sx={(t) => ({
                  p: 2,
                  borderRadius: 2.5,
                  border: `1px solid ${alpha(t.palette.divider, 0.85)}`,
                  backgroundColor:
                    t.palette.mode === "dark"
                      ? alpha(t.palette.primary.main, 0.12)
                      : alpha(t.palette.primary.main, 0.06),
                })}
              >
                <Stack direction={{ xs: "column", md: "row" }} gap={1} alignItems={{ md: "center" }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 900, lineHeight: 1.25 }} noWrap title={it.session.name}>
                      {it.session.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {it.session.type} • {it.session.level} • {fmtTimeRange(it.session.startAt, it.session.endAt)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fmtDateTime(it.session.startAt)}
                    </Typography>
                  </Box>

                  <Stack direction="row" gap={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Obecni: {presentCount}/{it.participants.length}
                    </Typography>

                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={() => saveActive(sid, it.participants)}
                      disabled={updateMut.isPending || !it.canEdit}
                    >
                      {updateMut.isPending ? "Zapisywanie..." : "Zapisz"}
                    </Button>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                {it.participants.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Brak zapisanych uczestników.
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: 1,
                    }}
                  >
                    {it.participants.map((p) => {
                      const checked = (localMap[p.id] ?? p.status) === "present";

                      return (
                        <Box
                          key={p.id}
                          sx={(t) => ({
                            p: 1,
                            borderRadius: 2,
                            border: `1px solid ${alpha(t.palette.divider, 0.75)}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            backgroundColor: checked
                              ? alpha(t.palette.success.main, t.palette.mode === "dark" ? 0.18 : 0.1)
                              : "transparent",
                            transition: "background-color .12s ease",
                          })}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 0 }} noWrap title={p.name}>
                            {p.name}
                          </Typography>

                          <Checkbox
                            checked={checked}
                            onChange={() => toggleActive(sid, p.id)}
                            disabled={!it.canEdit || updateMut.isPending}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Paper>
            );
          })}
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={(t) => ({
          p: { xs: 1.5, md: 2.25 },
          borderRadius: 3,
          border: `1px solid ${alpha(t.palette.divider, 0.85)}`,
        })}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          gap={1.25}
          mb={1.5}
        >
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Historia zajęć
          </Typography>

          <TextField
            size="small"
            value={searchPast}
            onChange={(e) => setSearchPast(e.target.value)}
            placeholder="Szukaj: nazwa, typ, poziom…"
            sx={{ width: { xs: "100%", sm: 360 } }}
          />
        </Stack>

        {pastQ.isLoading && (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={28} />
          </Box>
        )}

        {pastQ.isError && (
          <Typography color="error" variant="body2">
            Nie udało się pobrać historii zajęć.
          </Typography>
        )}

        {!pastQ.isLoading && !pastQ.isError && pastItems.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Brak zakończonych zajęć.
          </Typography>
        )}

        <Box>
          {pastItems.map((s) => {
            const isExpanded = expandedPastId === s.id;

            return (
              <Accordion
                key={s.id}
                expanded={isExpanded}
                onChange={(_, exp) => setExpandedPastId(exp ? s.id : null)}
                disableGutters
                elevation={0}
                sx={(t) => ({
                  borderRadius: 2,
                  border: `1px solid ${alpha(t.palette.divider, 0.85)}`,
                  mb: 1,
                  "&:before": { display: "none" },
                  overflow: "hidden",
                })}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 900, lineHeight: 1.2 }} noWrap title={s.name}>
                        {s.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {s.type} • {s.level} • {fmtTimeRange(s.startAt, s.endAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {fmtDateTime(s.startAt)}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 0 }}>
                  {isExpanded && pastDetailsQ.isLoading && (
                    <Box display="flex" justifyContent="center" py={2}>
                      <CircularProgress size={24} />
                    </Box>
                  )}

                  {isExpanded && pastDetailsQ.isError && (
                    <Typography color="error" variant="body2">
                      Nie udało się pobrać listy uczestników.
                    </Typography>
                  )}

                  {isExpanded && pastDetailsQ.data && (
                    <Box sx={{ pt: 1 }}>
                      {pastDetailsQ.data.participants.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Brak zapisanych uczestników.
                        </Typography>
                      ) : (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr",
                            gap: 1,
                          }}
                        >
                          {pastDetailsQ.data.participants.map((p) => (
                            <Box
                              key={p.id}
                              sx={(t) => ({
                                p: 1,
                                borderRadius: 2,
                                border: `1px solid ${alpha(t.palette.divider, 0.75)}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1,
                                backgroundColor:
                                  p.status === "present"
                                    ? alpha(t.palette.success.main, t.palette.mode === "dark" ? 0.18 : 0.1)
                                    : "transparent",
                              })}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700, minWidth: 0 }}
                                noWrap
                                title={p.name}
                              >
                                {p.name}
                              </Typography>

                              <Checkbox checked={p.status === "present"} disabled />
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </Paper>

      <Snackbar open={okOpen} autoHideDuration={2600} onClose={() => setOkOpen(false)}>
        <Alert onClose={() => setOkOpen(false)} severity="success" variant="filled">
          Zapisano obecność.
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
