import { Paper, Typography } from "@mui/material";

export default function TrainerCreateSessions() {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0}>
      <Typography variant="h6" gutterBottom>Dodawanie zajęć</Typography>
      <Typography variant="body2" color="text.secondary">
        Tu będzie grafik trenera + formularz dodawania zajęć.
      </Typography>
    </Paper>
  );
}
