import { Paper, Typography } from "@mui/material";

export default function TrainerAttendance() {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0}>
      <Typography variant="h6" gutterBottom>Obecności</Typography>
      <Typography variant="body2" color="text.secondary">
        OBECNOŚĆ
      </Typography>
    </Paper>
  );
}
